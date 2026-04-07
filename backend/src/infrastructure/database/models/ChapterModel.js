// src/infrastructure/database/models/ChapterModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class ChapterModel extends BaseModel {}

ChapterModel.init({
  ...BaseModel.initBaseAttributes(),
  subjectId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  sequelize,
  tableName: "chapters",
  timestamps: true, 
  indexes: [
    { fields: ["subjectId"] },
    { fields: ["order"] },
    { fields: ["subjectId", "order"] }
  ]
});

module.exports = ChapterModel;