// src/infrastructure/database/models/RolePermissionModel.js
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class RolePermissionModel extends Model {}

RolePermissionModel.init({
  roleId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true, // Kết hợp tạo Composite PK
    references: {
      model: 'roles',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  permissionId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true, // Kết hợp tạo Composite PK
    references: {
      model: 'permissions',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  sequelize,
  tableName: "role_permissions",
  timestamps: false, // Bảng trung gian thường không cần timestamp để tối ưu dung lượng
  indexes: [
    { fields: ["roleId"] },
    { fields: ["permissionId"] }
  ]
});

module.exports = RolePermissionModel;