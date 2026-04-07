// src/infrastructure/repositories/RoleRepository.js
const BaseRepository = require("./BaseRepository");
const RoleModel = require("../database/models/RoleModel");
const roleMapper = require("../mappers/RoleMapper");

class RoleRepository extends BaseRepository {
  constructor() {
    super(RoleModel, roleMapper);
  }

  async findByName(name) {
    const record = await this.model.findOne({
      where: { name, isDeleted: false }
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}

module.exports = new RoleRepository();
