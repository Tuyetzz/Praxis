// src/infrastructure/database/models/AttemptModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class AttemptModel extends BaseModel {}

AttemptModel.init({
  
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  chapterId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  mode: {
    type: DataTypes.ENUM("exam", "practice"),
    allowNull: false,
    defaultValue: "practice",
  },
  status: {
    type: DataTypes.ENUM("draft", "in_progress", "submitted", "expired", "graded"),
    defaultValue: "draft",
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  timeSpentSeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  score: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  maxScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
  }
}, {
  sequelize,
  tableName: "attempts",
  timestamps: true,
  indexes: [
    { fields: ["userId"] },
    { fields: ["mode"] },
    { fields: ["status"] },
    { fields: ["subjectId", "chapterId"] },
    { fields: ["userId", "mode", "status"] }, // Optimize cho query bài đang làm
  ]
});

module.exports = AttemptModel;