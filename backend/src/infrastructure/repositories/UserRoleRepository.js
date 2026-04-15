// src/infrastructure/repositories/UserRoleRepository.js
const UserRoleModel = require("../database/models/UserRoleModel");
const RoleModel = require("../database/models/RoleModel");
const UserModel = require("../database/models/UserModel");
const roleMapper = require("../mappers/RoleMapper");

class UserRoleRepository {
  async assignRoleToUser(userId, roleId) {
    await UserRoleModel.create({
      userId,
      roleId
    });
  }

  async removeRoleFromUser(userId, roleId) {
    await UserRoleModel.destroy({
      where: { userId, roleId }
    });
  }

  async getRolesForUser(userId) {
    const records = await RoleModel.findAll({
      include: [{
        model: UserModel,
        where: { id: userId, isDeleted: false },
        through: { attributes: [] }
      }],
      where: { isDeleted: false }
    });
    return records.map(record => roleMapper.toDomain(record));
  }

  async assignRolesToUser(userId, roleIds) {
    // Remove all existing roles for this user
    await UserRoleModel.destroy({ where: { userId } });
    
    // Assign new roles
    const assignments = roleIds.map(roleId => ({
      userId,
      roleId
    }));
    
    await UserRoleModel.bulkCreate(assignments);
  }

  async checkRoleExists(userId, roleId) {
    const record = await UserRoleModel.findOne({
      where: { userId, roleId }
    });
    return !!record;
  }
}

module.exports = UserRoleRepository;
