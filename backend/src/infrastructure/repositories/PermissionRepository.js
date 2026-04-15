// src/infrastructure/repositories/PermissionRepository.js
const PermissionModel = require("../database/models/PermissionModel");
const permissionMapper = require("../mappers/PermissionMapper");

class PermissionRepository {
  constructor() {
    this.model = PermissionModel;
    this.mapper = permissionMapper;
  }

  async findById(id) {
    const record = await this.model.findOne({
      where: { id }
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async findAll() {
    const records = await this.model.findAll({
      where: { }
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findBySlug(slug) {
    const record = await this.model.findOne({
      where: { slug }
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}

module.exports = PermissionRepository;
