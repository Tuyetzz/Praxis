const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true, // Return limit information in headers (RateLimit-Limit, etc.)
  legacyHeaders: false, // Disable the old X-RateLimit- headers
});

module.exports = limiter;