// src/infrastructure/database/models/AttemptQuestionModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class AttemptQuestionModel extends BaseModel {}

AttemptQuestionModel.init({
  ...BaseModel.initBaseAttributes(),
  attemptId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  optionOrder: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "Lưu thứ tự các phương án đã được xáo trộn cho lượt làm bài này"
  },
  pageIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  sequelize,
  tableName: "attempt_questions",
  timestamps: true,
  indexes: [
    { fields: ["attemptId"] },
    { fields: ["questionId"] },
    { fields: ["attemptId", "pageIndex"] } 
  ]
});

module.exports = AttemptQuestionModel;