// app.js
const express = require("express");
const app = express();
const httpLogger = require("./interfaces/middlewares/httpLogger");
const cors = require("cors");
const rateLimiter = require("./interfaces/middlewares/rateLimiter");

app.use(express.json());
app.use(httpLogger);

// CORS.
//
// In production the SPA and the API share one origin (nginx serves both), so
// requests are same-origin and CORS never applies. This list only matters for
// development, where Vite runs on :5173 and calls the API on :5000.
//
// Set CORS_ORIGINS (comma-separated) to override - useful if you ever serve the
// frontend from a different host than the API.
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : ["http://localhost:5173"];

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header: same-origin requests, curl, Postman, server-to-server.
      // These are not subject to CORS, so let them through.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Reject without throwing, so the response is a plain 403 rather than a
      // 500 from an unhandled error (there is no global error handler).
      return callback(null, false);
    },
  })
);

// app.use("/api", rateLimiter);
app.use("/api", require("./interfaces/routes"));

app.get("/", (req, res) => res.send("API running 🚀"));
module.exports = app;
