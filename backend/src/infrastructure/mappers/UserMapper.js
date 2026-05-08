// src/infrastructure/mappers/UserMapper.js
const BaseMapper = require("./BaseMapper");
const UserEntity = require("../../domain/entities/User");

class UserMapper extends BaseMapper {
  constructor() {
    super(UserEntity);
  }

  toDomain(model) {
    if (!model) return null;
    const data = model instanceof Object && model.get ? model.get({ plain: true }) : model;
    const entity = new this.EntityClass(data);
    const roleRecords = data.RoleModels || data.Roles || data.roles || [];

    if (Array.isArray(roleRecords)) {
      entity.roles = roleRecords
        .map((role) => role?.name)
        .filter(Boolean);
    }
    return entity;
  }
}

module.exports = new UserMapper();
