// src/infrastructure/mappers/RoleMapper.js
const BaseMapper = require("./BaseMapper");
const RoleEntity = require("../../domain/entities/Role");

class RoleMapper extends BaseMapper {
  constructor() {
    super(RoleEntity);
  }

  toDomain(model) {
    const entity = super.toDomain(model);
    return entity;
  }
}

module.exports = new RoleMapper();
