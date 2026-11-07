// src/infrastructure/cache/redisClient.js

const { createClient } = require("redis");
const logger = require("../utils/logger");

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || "6379";
const redisUrl = `redis://${redisHost}:${redisPort}`;

// Fail the connect attempt after this long instead of retrying forever.
const CONNECT_TIMEOUT_MS = Number(process.env.REDIS_CONNECT_TIMEOUT_MS) || 2000;

const client = createClient({ url: redisUrl });
let isConnected = false;
let connectPromise = null;

const resetConnectionState = () => {
  isConnected = false;
  connectPromise = null;
};

client.on("error", (err) => {
  logger.error(`[Redis] Error: ${err.message}`);
});

client.on("end", () => {
  resetConnectionState();
  logger.warn("[Redis] Connection ended.");
});

client.on("reconnecting", () => {
  resetConnectionState();
  logger.warn("[Redis] Reconnecting...");
});

const ensureConnected = async () => {
  if (isConnected) {
    return;
  }
  if (!connectPromise) {
    connectPromise = (async () => {
      try {
        // Bound the connect attempt. node-redis retries a dead server forever,
        // so without this the promise never settles and every request that
        // touches the cache hangs until the client gives up (which is never).
        await Promise.race([
          client.connect(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error(`Redis connect timed out after ${CONNECT_TIMEOUT_MS}ms`)),
              CONNECT_TIMEOUT_MS
            )
          ),
        ]);
        isConnected = true;
      } catch (err) {
        resetConnectionState();
        throw err;
      }
    })();
  }
  return connectPromise;
};

const redisClient = {
  /**
   * Round-trip check against Redis. Used by the health endpoint.
   * Throws if Redis is unreachable (ensureConnected has a bounded timeout).
   */
  async ping() {
    await ensureConnected();
    return client.ping();
  },

  async get(key) {
    await ensureConnected();
    logger.info(`[Redis] GET ${key}`);
    return client.get(key);
  },

  async set(key, value, mode, duration) {
    await ensureConnected();
    logger.info(`[Redis] SET ${key} (TTL: ${duration || 0}s)`);

    if (mode === "EX" && duration) {
      return client.set(key, value, { EX: duration });
    }

    return client.set(key, value);
  },

  async del(key) {
    await ensureConnected();
    logger.info(`[Redis] DEL ${key}`);
    return client.del(key);
  },

  async delPattern(pattern) {
    await ensureConnected();
    logger.info(`[Redis] DEL pattern ${pattern}`);

    const keys = await client.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }

    return client.del(keys);
  }
};

module.exports = redisClient;