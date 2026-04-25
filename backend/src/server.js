require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./infrastructure/database/models");
const container = require("./container");

const PORT = process.env.PORT || 5000;
const AUTO_SUBMIT_ENABLED = process.env.AUTO_SUBMIT_ENABLED === "true";

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    if (AUTO_SUBMIT_ENABLED) {
      const autoSubmitJob = container.resolve("autoSubmitAttemptsJob");
      autoSubmitJob.start();
    }

    process.on("SIGTERM", async () => {
      console.log("📌 SIGTERM received, gracefully shutting down...");
      if (AUTO_SUBMIT_ENABLED) {
        const autoSubmitJob = container.resolve("autoSubmitAttemptsJob");
        autoSubmitJob.stop();
      }
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("❌ Unable to connect to DB:", err);
    process.exit(1);
  }
})();
