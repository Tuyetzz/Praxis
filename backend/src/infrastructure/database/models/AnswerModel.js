// src/infrastructure/database/models/AnswerModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class AnswerModel extends BaseModel {}

AnswerModel.init({
  attemptId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  optionId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  selectedOptionIds: {
    type: DataTypes.JSON,
    allowNull: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  earnedPoints: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  answeredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  flagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  tableName: "answers",
  timestamps: true
});

module.exports = AnswerModel;