// src/infrastructure/repositories/PermissionRepository.js
const BaseRepository = require("./BaseRepository");
const PermissionModel = require("../database/models/PermissionModel");
const permissionMapper = require("../mappers/PermissionMapper");

class PermissionRepository extends BaseRepository {
  constructor() {
    super(PermissionModel, permissionMapper);
  }

  async findBySlug(slug) {
    const record = await this.model.findOne({
      where: { slug, isDeleted: false }
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}

module.exports = new PermissionRepository();
