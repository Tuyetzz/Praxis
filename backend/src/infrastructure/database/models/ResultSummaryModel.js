// src/infrastructure/database/models/ResultSummaryModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class ResultSummaryModel extends BaseModel {}

ResultSummaryModel.init({
  ...BaseModel.initBaseAttributes(),
  attemptId: {
    type: DataTypes.UUID, // Đồng bộ UUID
    allowNull: false,
    unique: true, // Một Attempt chỉ có duy nhất một bản tóm tắt kết quả
  },
  correctCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  wrongCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  blankCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: "Thứ hạng của người dùng trong kỳ thi này"
  }
}, {
  sequelize,
  tableName: "result_summaries",
  timestamps: true,
  indexes: [
    { fields: ["attemptId"] },
    { fields: ["rank"] },
    { fields: ["correctCount"] } 
  ]
});

module.exports = ResultSummaryModel;