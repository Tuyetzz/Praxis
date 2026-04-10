// src/usecases/role/AssignPermissionToRole.js
const roleRepository = require('../../infrastructure/repositories/RoleRepository');
const permissionRepository = require('../../infrastructure/repositories/PermissionRepository');
const rolePermissionRepository = require('../../infrastructure/repositories/RolePermissionRepository');
const redisClient = require('../../infrastructure/cache/redisClient');

class AssignPermissionToRole {
  async execute(roleId, permissionId) {
    if (!roleId || !permissionId) {
      throw new Error("Role ID and Permission ID are required.");
    }

    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found.");
    }

    const permission = await permissionRepository.findById(permissionId);
    if (!permission) {
      throw new Error("Permission not found.");
    }

    const alreadyExists = await rolePermissionRepository.checkPermissionExists(roleId, permissionId);
    if (alreadyExists) {
      throw new Error("This permission is already assigned to this role.");
    }

    await rolePermissionRepository.assignPermissionToRole(roleId, permissionId);

    // Clear all user permissions cache since roles have changed
    await redisClient.delPattern('user_permissions:*');

    return {
      message: "Permission assigned to role successfully.",
      roleId,
      permissionId
    };
  }
}

module.exports = new AssignPermissionToRole();
