// src/infrastructure/repositories/RolePermissionRepository.js
const RolePermissionModel = require("../database/models/RolePermissionModel");
const PermissionModel = require("../database/models/PermissionModel");
const RoleModel = require("../database/models/RoleModel");
const permissionMapper = require("../mappers/PermissionMapper");

class RolePermissionRepository {
  async assignPermissionToRole(roleId, permissionId) {
    await RolePermissionModel.create({
      roleId,
      permissionId
    });
  }

  async removePermissionFromRole(roleId, permissionId) {
    await RolePermissionModel.destroy({
      where: { roleId, permissionId }
    });
  }

  async getPermissionsForRole(roleId) {
    const records = await PermissionModel.findAll({
      include: [{
        model: RoleModel,
        where: { id: roleId, isDeleted: false },
        through: { attributes: [] }
      }]
    });
    return records.map(record => permissionMapper.toDomain(record));
  }

  async assignPermissionsToRole(roleId, permissionIds) {
    // Remove all existing permissions for this role
    await RolePermissionModel.destroy({ where: { roleId } });
    
    // Assign new permissions
    const assignments = permissionIds.map(permissionId => ({
      roleId,
      permissionId
    }));
    
    await RolePermissionModel.bulkCreate(assignments);
  }

  async checkPermissionExists(roleId, permissionId) {
    const record = await RolePermissionModel.findOne({
      where: { roleId, permissionId }
    });
    return !!record;
  }
}

module.exports = RolePermissionRepository;
