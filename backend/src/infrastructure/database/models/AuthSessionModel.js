// src/infrastructure/database/models/AuthSessionModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class AuthSessionModel extends BaseModel {}

AuthSessionModel.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID, 
    allowNull: false,
  },
  refreshToken: {
    type: DataTypes.STRING(500), 
    allowNull: false,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING(45), 
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  sequelize,
  tableName: "auth_sessions",
  timestamps: true,
  indexes: [
    { fields: ["userId"] },
    { fields: ["refreshToken"] },
    { fields: ["expiresAt"] },
    { fields: ["userId", "revokedAt", "expiresAt"] } 
  ]
});

module.exports = AuthSessionModel;