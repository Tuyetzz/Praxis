// src/usecases/health/CheckHealth.js
const { sequelize } = require("../../infrastructure/database/models");

/**
 * Report whether the service and its dependencies are usable.
 *
 * Used by the container healthcheck and any uptime monitor. There are two
 * levels on purpose:
 *
 *   - liveness  ("is the process up?")  -> always ok if we can answer at all
 *   - readiness ("can it serve traffic?") -> needs the dependencies below
 *
 * Each dependency is probed with its own timeout so one slow/unreachable
 * service cannot stall the whole check - that would make the container look
 * dead when it is really just waiting on something else.
 */
class CheckHealth {
  constructor({ redisClient }) {
    this.redisClient = redisClient;
  }

  async execute({ timeoutMs = 2000 } = {}) {
    const [database, cache] = await Promise.all([
      this._probeDatabase(timeoutMs),
      this._probeRedis(timeoutMs),
    ]);

    // Redis is an optimization (the permission cache falls back to the DB when
    // it is down), so it is reported but does NOT make the service unready.
    const ready = database.ok;

    return {
      status: ready ? "ok" : "degraded",
      ready,
      uptimeSeconds: Math.floor(process.uptime()),
      checks: { database, cache },
    };
  }

  async _probeDatabase(timeoutMs) {
    const startedAt = Date.now();
    try {
      await this._withTimeout(sequelize.authenticate(), timeoutMs, "Database");
      return { ok: true, latencyMs: Date.now() - startedAt };
    } catch (error) {
      return { ok: false, latencyMs: Date.now() - startedAt, error: error.message };
    }
  }

  async _probeRedis(timeoutMs) {
    const startedAt = Date.now();
    try {
      await this._withTimeout(this.redisClient.ping(), timeoutMs, "Redis");
      return { ok: true, latencyMs: Date.now() - startedAt };
    } catch (error) {
      return { ok: false, latencyMs: Date.now() - startedAt, error: error.message };
    }
  }

  _withTimeout(promise, ms, label) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} check timed out after ${ms}ms`)), ms);
    });

    // Promise.race keeps whichever settles first; clear the timer so a resolved
    // probe doesn't leave a pending handle keeping the process alive.
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }
}

module.exports = CheckHealth;
