// src/infrastructure/database/models/UserModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class UserModel extends BaseModel {}

UserModel.init({
  
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  sequelize,
  tableName: "users",
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ["passwordHash"] } 
  },
  hooks: {
    beforeValidate: (user) => {
      if (user.email) user.email = user.email.trim().toLowerCase();
    }
  },
  indexes: [
    { fields: ["email"], unique: true },
    { fields: ["status"] }
  ]
});

module.exports = UserModel;