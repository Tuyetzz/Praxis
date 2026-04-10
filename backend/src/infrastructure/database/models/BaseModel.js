// src/infrastructure/database/models/BaseModel.js
const { Model, DataTypes } = require('sequelize');
const storage = require('../../context/storage'); 
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

    // Helper function to compose audit hooks with model-specific hooks
    const composeHook = (auditHook, modelHook) => {
      if (!modelHook) return auditHook;
      if (Array.isArray(modelHook)) {
        return [auditHook, ...modelHook];
      }
      return async (instance) => {
        await auditHook(instance);
        await modelHook(instance);
      };
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
          beforeCreate: composeHook(auditHooks.beforeCreate, options.hooks?.beforeCreate),
          beforeUpdate: composeHook(auditHooks.beforeUpdate, options.hooks?.beforeUpdate),
          ...(options.hooks ? Object.fromEntries(
            Object.entries(options.hooks).filter(([key]) => !['beforeCreate', 'beforeUpdate'].includes(key))
          ) : {}),
        },
        timestamps: true,
      }
    );
  }
}

module.exports = BaseModel;