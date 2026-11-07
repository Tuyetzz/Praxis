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

    await sequelize.sync({ alter: false });
    console.log("✅ All models synchronized");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    const autoSubmitJob = AUTO_SUBMIT_ENABLED
      ? container.resolve("autoSubmitAttemptsJob")
      : null;
    if (autoSubmitJob) {
      autoSubmitJob.start();
    }
    let isShuttingDown = false;
    const shutdown = async (signal) => {
      if (isShuttingDown) {
        return;
      }
      isShuttingDown = true;
      console.log(`📌 ${signal} received, gracefully shutting down...`);
      try {
        if (autoSubmitJob) {
          autoSubmitJob.stop();
        }
        await new Promise((resolve, reject) => {
          server.close((err) => {
            if (err) {
              return reject(err);
            }
            console.log("✅ Server closed");
            resolve();
          });
        });
        await sequelize.close();
        console.log("✅ Database connection closed");
        process.exit(0);
      } catch (err) {
        console.error("❌ Error during graceful shutdown:", err);
        process.exit(1);
      }
    };
    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    console.error("❌ Unable to connect to DB:", err);
    process.exit(1);
  }
})();
