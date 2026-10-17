// src/infrastructure/database/models/AttemptQuestionModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class AttemptQuestionModel extends BaseModel {}

AttemptQuestionModel.init({
  
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
  },
  sequence: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: "Vị trí của câu trong lượt làm bài (0-based), giữ nguyên thứ tự sau khi xáo trộn"
  }
}, {
  sequelize,
  tableName: "attempt_questions",
  timestamps: true,
  indexes: [
    { fields: ["attemptId"] },
    { fields: ["questionId"] },
    { fields: ["attemptId", "pageIndex"] },
    { fields: ["attemptId", "sequence"] }
  ]
});

module.exports = AttemptQuestionModel;