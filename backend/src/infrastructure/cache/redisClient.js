// src/infrastructure/cache/redisClient.js

const { createClient } = require("redis");
const logger = require("../utils/logger");

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || "6379";
const redisUrl = `redis://${redisHost}:${redisPort}`;

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
        await client.connect();
        isConnected = true;
      } catch (err) {
        resetConnectionState();
        throw err;
      }
    })();
  }
  await connectPromise;
};

const redisClient = {
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