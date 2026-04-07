// src/infrastructure/mappers/PermissionMapper.js
const BaseMapper = require("./BaseMapper");
const PermissionEntity = require("../../domain/entities/Permission");

class PermissionMapper extends BaseMapper {
  constructor() {
    super(PermissionEntity);
  }

  toDomain(model) {
    const entity = super.toDomain(model);
    return entity;
  }
}

module.exports = new PermissionMapper();
