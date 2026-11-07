// src/infrastructure/database/models/QuestionModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");
const QUESTIONS_TYPE_ENUM = require("../../../domain/constants/questions_type_enum");

class QuestionModel extends BaseModel {}

QuestionModel.init({
  
  subjectId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  chapterId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(...Object.values(QUESTIONS_TYPE_ENUM)),
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  difficulty: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: "1: Easy, 2: Medium, 3: Hard"
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  media: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
  }
}, {
  sequelize,
  tableName: "questions",
  timestamps: true,
  indexes: [
    { fields: ["subjectId"] },
    { fields: ["chapterId"] },
    { fields: ["type"] },
    { fields: ["difficulty"] },
    { fields: ["subjectId", "chapterId"] }
  ]
});

module.exports = QuestionModel;