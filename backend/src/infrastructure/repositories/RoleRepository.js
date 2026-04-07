// src/infrastructure/repositories/RoleRepository.js
const BaseRepository = require("./BaseRepository");
const RoleModel = require("../database/models/RoleModel");
const roleMapper = require("../mappers/RoleMapper");
const UserModel = require("../database/models/UserModel");
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

  async loadRolesForUser(userId) {
    const records = await this.model.findAll({
      include: [{
        model: UserModel,
        where: { id: userId, isDeleted: false },
        through: { attributes: [] }
      }],
      where: { isDeleted: false }
    });
    return records.map(record => this.mapper.toDomain(record));
  }
}

module.exports = new RoleRepository();
