// src/infrastructure/database/models/RoleModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class RoleModel extends BaseModel {}

RoleModel.init({
  
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  }
}, {
  sequelize,
  tableName: "roles",
  timestamps: true,
  indexes: [
    { fields: ["name"], unique: true }
  ]
});

module.exports = RoleModel;