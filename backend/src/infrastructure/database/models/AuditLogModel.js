// src/infrastructure/database/models/AuditLogModel.js
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class AuditLogModel extends Model {}

AuditLogModel.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  actorUserId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  sequelize,
  tableName: "audit_logs",
  timestamps: true,
  updatedAt: false, 
  indexes: [
    { fields: ["actorUserId"] },
    { fields: ["action"] },
    { fields: ["entityType", "entityId"] },
    { fields: ["createdAt"] }
  ]
});

module.exports = AuditLogModel;