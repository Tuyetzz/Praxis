// src/infrastructure/database/models/PermissionModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class PermissionModel extends BaseModel {}

PermissionModel.init({
  ...BaseModel.initBaseAttributes(),
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  }
}, {
  sequelize,
  tableName: "permissions",
  timestamps: true,
  indexes: []
});

module.exports = PermissionModel;