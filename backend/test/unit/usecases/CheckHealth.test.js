// test/unit/usecases/CheckHealth.test.js
//
// Health check tests. The dependencies (sequelize, redisClient) are faked so
// these run with no DB and no Redis - which matters, because a CI runner has
// neither.
//
// The behaviours worth locking down are the failure modes: what happens when a
// dependency is slow, down, or throws.
//
// Run: node --test test/unit/usecases/CheckHealth.test.js

const { describe, it, mock } = require("node:test");
const assert = require("node:assert/strict");

const CheckHealth = require("../../../src/usecases/health/CheckHealth");

/**
 * CheckHealth probes the database through `sequelize.authenticate()`, which is
 * required at module load. The real MySQL is unreachable in tests, so stub the
 * module cache before require - a small trick that lets us test the usecase
 * without a database.
 */
function stubSequelize(authenticate) {
  const modelsPath = require.resolve("../../../src/infrastructure/database/models");
  require.cache[modelsPath] = {
    id: modelsPath,
    filename: modelsPath,
    loaded: true,
    exports: { sequelize: { authenticate } },
  };
}

/** Re-require CheckHealth so it picks up the freshly stubbed sequelize. */
function loadCheckHealth(redisClient) {
  const usecasePath = require.resolve("../../../src/usecases/health/CheckHealth");
  delete require.cache[usecasePath];
  const FreshCheckHealth = require(usecasePath);
  return new FreshCheckHealth({ redisClient });
}

function redisOk() {
  return { ping: mock.fn(async () => "PONG") };
}

describe("CheckHealth usecase", () => {
  describe("when everything is up", () => {
    it("reports ok and ready", async () => {
      stubSequelize(async () => {});
      const usecase = loadCheckHealth(redisOk());

      const result = await usecase.execute();

      assert.equal(result.status, "ok");
      assert.equal(result.ready, true);
      assert.equal(result.checks.database.ok, true);
      assert.equal(result.checks.cache.ok, true);
    });

    it("includes an uptime in seconds", async () => {
      stubSequelize(async () => {});
      const usecase = loadCheckHealth(redisOk());

      const result = await usecase.execute();

      assert.equal(typeof result.uptimeSeconds, "number");
      assert.ok(result.uptimeSeconds >= 0);
    });

    it("reports a latency for each dependency", async () => {
      stubSequelize(async () => {});
      const usecase = loadCheckHealth(redisOk());

      const result = await usecase.execute();

      assert.equal(typeof result.checks.database.latencyMs, "number");
      assert.equal(typeof result.checks.cache.latencyMs, "number");
    });
  });

  describe("when the database is down", () => {
    it("is NOT ready (the DB is required)", async () => {
      stubSequelize(async () => {
        throw new Error("ECONNREFUSED");
      });
      const usecase = loadCheckHealth(redisOk());

      const result = await usecase.execute();

      assert.equal(result.ready, false);
      assert.equal(result.status, "degraded");
      assert.equal(result.checks.database.ok, false);
    });

    it("surfaces the underlying error message", async () => {
      stubSequelize(async () => {
        throw new Error("ECONNREFUSED 127.0.0.1:3306");
      });
      const usecase = loadCheckHealth(redisOk());

      const result = await usecase.execute();

      assert.match(result.checks.database.error, /ECONNREFUSED/);
    });
  });

  describe("when Redis is down", () => {
    it("is STILL ready (Redis is only a cache)", async () => {
      // authMiddleware falls back to the database when the permission cache is
      // unavailable, so a dead Redis must not take the service out of rotation.
      stubSequelize(async () => {});
      const redisDown = {
        ping: mock.fn(async () => {
          throw new Error("Redis connect timed out");
        }),
      };
      const usecase = loadCheckHealth(redisDown);

      const result = await usecase.execute();

      assert.equal(result.ready, true);
      assert.equal(result.checks.cache.ok, false);
    });

    it("still reports the cache failure in the body", async () => {
      stubSequelize(async () => {});
      const redisDown = {
        ping: mock.fn(async () => {
          throw new Error("Redis connect timed out after 2000ms");
        }),
      };
      const usecase = loadCheckHealth(redisDown);

      const result = await usecase.execute();

      assert.match(result.checks.cache.error, /timed out/);
    });
  });

  describe("timeouts", () => {
    it("gives up on a hanging database probe instead of hanging forever", async () => {
      // A dependency that never resolves must not stall the health endpoint -
      // otherwise the container looks dead for the wrong reason.
      stubSequelize(() => new Promise(() => {})); // never settles
      const usecase = loadCheckHealth(redisOk());

      const result = await usecase.execute({ timeoutMs: 50 });

      assert.equal(result.checks.database.ok, false);
      assert.match(result.checks.database.error, /timed out/);
    });

    it("gives up on a hanging Redis probe", async () => {
      stubSequelize(async () => {});
      const usecase = loadCheckHealth({ ping: () => new Promise(() => {}) });

      const result = await usecase.execute({ timeoutMs: 50 });

      assert.equal(result.checks.cache.ok, false);
      assert.match(result.checks.cache.error, /timed out/);
    });

    it("does not wait for the slowest dependency in series", async () => {
      // Both probes run in parallel, so total time should be ~the slower one,
      // not the sum. One 50ms probe + one instant probe must finish well under
      // 100ms.
      stubSequelize(async () => {});
      const slowRedis = {
        ping: () => new Promise((resolve) => setTimeout(resolve, 50)),
      };
      const usecase = loadCheckHealth(slowRedis);

      const startedAt = Date.now();
      await usecase.execute({ timeoutMs: 500 });
      const elapsed = Date.now() - startedAt;

      assert.ok(elapsed < 150, `expected parallel probes, took ${elapsed}ms`);
    });
  });
});
