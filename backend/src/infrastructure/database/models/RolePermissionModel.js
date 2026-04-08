// src/infrastructure/database/models/RolePermissionModel.js
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class RolePermissionModel extends Model {}

RolePermissionModel.init({
  roleId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true, 
    references: {
      model: 'roles',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  permissionId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true, 
    references: {
      model: 'permissions',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  sequelize,
  tableName: "role_permissions",
  timestamps: false, 
  indexes: [
    { fields: ["roleId"] },
    { fields: ["permissionId"] }
  ]
});

module.exports = RolePermissionModel;