require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./infrastructure/database/models");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({ alter: false });
    console.log("✅ All models synchronized");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Unable to connect to DB:", err);
    process.exit(1);
  }
})();
