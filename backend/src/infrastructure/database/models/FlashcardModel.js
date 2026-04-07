// src/infrastructure/database/models/FlashcardModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class FlashcardModel extends BaseModel {}

FlashcardModel.init({
  ...BaseModel.initBaseAttributes(),
  deckId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  frontText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  backText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  nextReview: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: "Thời điểm người dùng cần ôn tập lại thẻ này"
  }
}, {
  sequelize,
  tableName: "flashcards",
  timestamps: true,
  indexes: [
    { fields: ["deckId"] },
    { fields: ["nextReview"] },
    { fields: ["deckId", "order"] }
  ]
});

module.exports = FlashcardModel;