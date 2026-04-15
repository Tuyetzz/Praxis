// src/infrastructure/cache/redisClient.js

// I'm simulating Redis memory using a Javascript map 
// I'll switch to real Redis when i have more time to set it up and test it properly
// For now, this allows me to implement caching logic without blocking development on other features.

const memoryStorage = new Map();
const timeouts = new Map();
const logger = require('../utils/logger');

const redisClient = {
  async get(key) {
    logger.info(`[Cache-Map] Getting key: ${key}`);
    console.log("abc");
    return memoryStorage.get(key) || null;
  },

  async set(key, value, mode, duration) {
    logger.info(`[Cache-Map] Setting key: ${key} (TTL: ${duration}s)`);

    if (timeouts.has(key)) {
      clearTimeout(timeouts.get(key));
      timeouts.delete(key);
    }

    memoryStorage.set(key, value);
    
    if (mode === 'EX' && duration) {
      const timeoutId = setTimeout(() => {
        memoryStorage.delete(key);
        timeouts.delete(key); 
        logger.info(`[Cache-Map] Key expired and deleted: ${key}`);
      }, duration * 1000);

      timeouts.set(key, timeoutId);
    }
  },

  async del(key) {
    logger.info(`[Cache-Map] Deleting key: ${key}`);
    if (timeouts.has(key)) {
      clearTimeout(timeouts.get(key));
      timeouts.delete(key);
    }
    return memoryStorage.delete(key);
  },

  async delPattern(pattern) {
    logger.info(`[Cache-Map] Deleting keys with pattern: ${pattern}`);
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    let deletedCount = 0;
    for (const key of memoryStorage.keys()) {
      if (regex.test(key)) {
        await this.del(key);
        deletedCount++;
      }
    }
    logger.info(`[Cache-Map] Deleted ${deletedCount} keys with pattern: ${pattern}`);
    return deletedCount;
  }
};

module.exports = redisClient;