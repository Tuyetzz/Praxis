// src/infrastructure/database/models/TypingTextModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

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