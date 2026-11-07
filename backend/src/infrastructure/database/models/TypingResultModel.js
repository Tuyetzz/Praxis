// src/infrastructure/database/models/TypingResultModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class TypingResultModel extends BaseModel {}

TypingResultModel.init({
  
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  textId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  wpm: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  accuracy: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  rawWpm: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  durationSeconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  errorTags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "Store words or keys that were mistyped along with their counts, e.g. { 'k': 5, 'l': 2 }"
  }
}, {
  sequelize,
  tableName: "typing_results",
  timestamps: true,
  indexes: [
    { fields: ["userId"] },
    { fields: ["textId"] },
    { fields: ["wpm"] }, // Tối ưu cho việc lấy Top WPM (Leaderboard)
    { fields: ["userId", "createdAt"] } // Tối ưu cho biểu đồ tiến trình theo thời gian
  ]
});

module.exports = TypingResultModel;