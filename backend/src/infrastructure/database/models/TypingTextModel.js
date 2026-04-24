// src/infrastructure/database/models/TypingTextModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");
const TYPING_TEXT_TYPE_ENUM = require("../../../domain/constants/typing_text_type_enum");

class TypingTextModel extends BaseModel {}

TypingTextModel.init({
  
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  language: {
    type: DataTypes.STRING(50),
    defaultValue: 'vietnamese',
    allowNull: false,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'medium',
    allowNull: false,
  },
  sourceType: {
    type: DataTypes.ENUM(...Object.values(TYPING_TEXT_TYPE_ENUM)),
    allowNull: false,
    defaultValue: TYPING_TEXT_TYPE_ENUM.MANUAL,
    comment: 'The source of the typing text: manual, ai_summary, pdf, docx...'
  }
}, {
  sequelize,
  tableName: "typing_texts",
  timestamps: true,
  indexes: [
    { fields: ["authorId"] },
    { fields: ["language"] },
    { fields: ["difficulty"] },
    { fields: ["isPublic", "isDefault"] } 
  ]
});

module.exports = TypingTextModel;