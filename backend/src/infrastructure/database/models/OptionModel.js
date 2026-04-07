// src/infrastructure/database/models/OptionModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class OptionModel extends BaseModel {}

OptionModel.init({
  ...BaseModel.initBaseAttributes(),
  questionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  media: {
    type: DataTypes.STRING, // URL ảnh hoặc video đính kèm cho phương án
    allowNull: true,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  }
}, {
  sequelize,
  tableName: "options",
  timestamps: true,
  indexes: [
    { fields: ["questionId"] },
    { fields: ["order"] },
    { fields: ["questionId", "order"] }
  ]
});

module.exports = OptionModel;