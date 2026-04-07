// src/infrastructure/database/models/BaseModel.js
const { Model, DataTypes } = require('sequelize');

class BaseModel extends Model {
  static initBaseAttributes() {
    return {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.UUID, // Đổi sang UUID cho đồng bộ với User ID
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.UUID, // Đổi sang UUID
        allowNull: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }
    };
  }
}

module.exports = BaseModel;
