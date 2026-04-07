// src/infrastructure/database/models/UserRoleModel.js
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class UserRoleModel extends Model {}

UserRoleModel.init({
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: { model: 'roles', key: 'id' },
    onDelete: 'CASCADE'
  }
}, {
  sequelize,
  tableName: "user_roles",
  timestamps: false
});

module.exports = UserRoleModel;