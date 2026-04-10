// src/infrastructure/database/models/BaseModel.js
const { Model, DataTypes } = require('sequelize');
const storage = require('../../context/storage'); // Import cái AsyncLocalStorage của bạn
class BaseModel extends Model {

  static init(attributes, options) {
    const baseAttributes = {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }
    };

    const auditHooks = {
      beforeCreate: (instance) => {
        const store = storage.getStore();
        const userId = store?.userId;
        if (userId && !instance.createdBy) {
          instance.createdBy = userId;
        }
        if (userId && !instance.updatedBy) {
          instance.updatedBy = userId;
        }
      },
      beforeUpdate: (instance) => {
        const store = storage.getStore();
        const userId = store?.userId;
        if (userId) {
          instance.updatedBy = userId;
        }
      },
    };

    return super.init(
      { ...baseAttributes, ...attributes },
      {
        ...options,
        hooks: {
          ...auditHooks,
          ...(options.hooks || {}),
        },
        timestamps: true,
      }
    );
  }
}

module.exports = BaseModel;