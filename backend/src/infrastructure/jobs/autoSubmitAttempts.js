// src/infrastructure/jobs/autoSubmitAttempts.js
const schedule = require("node-schedule");

class AutoSubmitAttemptsJob {
  constructor({ attemptRepository, container, logger }) {
    this.attemptRepository = attemptRepository;
    this.container = container;
    this.logger = logger || console;
    this.job = null;
  }

  start() {
    if (this.job) {
      this.logger.warn("[AUTO-SUBMIT] Job is already running");
      return;
    }

    // Schedule to run every minute: "0 * * * * *" means at second 0 of every minute
    // Order of fields: second, minute, hour, day of month, month, day of week
    this.job = schedule.scheduleJob("0 * * * * *", async () => {
      await this.executeAutoSubmit();
    });

    this.logger.info("[AUTO-SUBMIT] Job started - runs every 60 seconds");
  }

  stop() {
    if (this.job) {
      this.job.cancel();
      this.job = null;
      this.logger.info("[AUTO-SUBMIT] Job stopped");
    }
  }

  async executeAutoSubmit() {
    try {
      const now = new Date();

      const expiredAttempts = await this.attemptRepository.findExpiredAttempts(now);

      if (!expiredAttempts || expiredAttempts.length === 0) {
        return; 
      }

      this.logger.info(
        `[AUTO-SUBMIT] Found ${expiredAttempts.length} expired attempt(s) to submit`
      );

      let successCount = 0;
      let failureCount = 0;
      const failures = [];

      for (const attempt of expiredAttempts) {
        try {
          const submitAttempt = this.container.resolve("submitAttempt");
          
          await submitAttempt.execute({
            userId: attempt.userId,
            attemptId: attempt.id,
          });

          successCount++;
          this.logger.info(
            `[AUTO-SUBMIT] Successfully submitted attempt ${attempt.id} for user ${attempt.userId}`
          );
        } catch (err) {
          failureCount++;
          failures.push({ attemptId: attempt.id, error: err.message });
          this.logger.error(
            `[AUTO-SUBMIT] Failed to submit attempt ${attempt.id}: ${err.message}`
          );
        }
      }

      // Log summary
      this.logger.info(
        `[AUTO-SUBMIT] Summary - Success: ${successCount}, Failed: ${failureCount}`
      );

      if (failures.length > 0) {
        this.logger.error(`[AUTO-SUBMIT] Failures: ${JSON.stringify(failures)}`);
      }
    } catch (err) {
      this.logger.error(`[AUTO-SUBMIT] Job error: ${err.message}`);
    }
  }
}

module.exports = AutoSubmitAttemptsJob;
