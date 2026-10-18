// src/interfaces/middlewares/aiRateLimiter.js
const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for the AI quiz generation endpoint.
 *
 * Stricter than the global limiter (which is currently disabled) to control
 * cost, since every call spends provider tokens.
 *
 * Note: there is deliberately no client-controllable bypass - a header such as
 * `x-internal-service: true` would be settable by anyone and defeat the limit.
 */
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // per key (user id, else IP) per window
  message: {
    status: 429,
    message: "Too many AI generation requests, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Prefer the authenticated user so one user can't multiply their quota with
  // multiple IPs. ipKeyGenerator normalises IPv6 addresses (required by v8).
  keyGenerator: (req, res) => {
    const userId = req.user?.id;
    if (userId) return `user:${userId}`;
    return rateLimit.ipKeyGenerator(req, res);
  },
});

module.exports = aiRateLimiter;
