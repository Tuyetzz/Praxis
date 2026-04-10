// src/infrastructure/database/models/SubjectModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class SubjectModel extends BaseModel {}

SubjectModel.init({
  
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  sequelize,
  tableName: "subjects",
  timestamps: true,
  indexes: [
    { fields: ["slug"] },
    { fields: ["order"] }
  ]
});

module.exports = SubjectModel;