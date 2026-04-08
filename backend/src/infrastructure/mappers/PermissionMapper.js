// src/infrastructure/mappers/PermissionMapper.js
const BaseMapper = require("./BaseMapper");
const PermissionEntity = require("../../domain/entities/Permission");

class PermissionMapper extends BaseMapper {
  constructor() {
    super(PermissionEntity);
  }

  toDomain(model) {
    if (!model) return null;
    const data = model instanceof Object && model.get ? model.get({ plain: true }) : model;

    return new PermissionEntity({
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description
    });
  }
}

module.exports = new PermissionMapper();
