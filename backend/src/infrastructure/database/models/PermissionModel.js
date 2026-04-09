// src/infrastructure/database/models/PermissionModel.js
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class PermissionModel extends Model {}

PermissionModel.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
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
  timestamps: false,
  indexes: []
});

module.exports = PermissionModel;