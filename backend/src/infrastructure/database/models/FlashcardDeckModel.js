// src/infrastructure/database/models/FlashcardDeckModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class FlashcardDeckModel extends BaseModel {}

FlashcardDeckModel.init({
  
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  }
}, {
  sequelize,
  tableName: "flashcard_decks",
  timestamps: true,
  indexes: [
    { fields: ["userId"] },
    { fields: ["isPublic"] },
    { fields: ["userId", "isPublic"] } 
  ]
});

module.exports = FlashcardDeckModel;