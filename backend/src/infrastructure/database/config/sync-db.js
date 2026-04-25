// src/infrastructure/database/config/sync-db.js
const { sequelize } = require("../models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
    await sequelize.sync({ alter: true }); 
    console.log("✅ Database schema synchronized!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Sync failed:", err);
    process.exit(1);
  }
})();