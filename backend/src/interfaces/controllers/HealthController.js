// src/interfaces/controllers/HealthController.js
class HealthController {
  constructor({ checkHealth }) {
    this.checkHealth = checkHealth;
  }

  /**
   * GET /health
   *
   * Returns 200 when ready to serve, 503 when a required dependency is down, so
   * Docker / Kubernetes / uptime monitors can act on the status code alone
   * without parsing the body.
   */
  async check(req, res) {
    try {
      const result = await this.checkHealth.execute();

      return res.status(result.ready ? 200 : 503).json({
        status: result.status,
        uptimeSeconds: result.uptimeSeconds,
        checks: result.checks,
      });
    } catch (error) {
      // The check itself failing means we cannot report anything useful.
      return res.status(503).json({
        status: "error",
        message: error.message,
      });
    }
  }

  /**
   * GET /health/live
   *
   * Liveness only: if this responds, the process is running. Deliberately does
   * NOT touch the database or Redis - a container should not be restarted just
   * because a dependency is briefly unavailable.
   */
  live(req, res) {
    return res.status(200).json({
      status: "ok",
      uptimeSeconds: Math.floor(process.uptime()),
    });
  }
}

module.exports = HealthController;
