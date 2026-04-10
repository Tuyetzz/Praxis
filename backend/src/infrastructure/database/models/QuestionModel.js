// src/infrastructure/database/models/QuestionModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

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
    type: DataTypes.ENUM("single", "multiple", "true_false", "fill_blank"),
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
    type: DataTypes.JSON, // Lưu mảng URL hoặc Object {type, url}
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON, // Lưu mảng string các tags
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
    { fields: ["subjectId", "chapterId"] } // Tối ưu load câu hỏi theo cấu trúc cây
  ]
});

module.exports = QuestionModel;