// src/usecases/role/RemovePermissionFromRole.js
const roleRepository = require('../../infrastructure/repositories/RoleRepository');
const permissionRepository = require('../../infrastructure/repositories/PermissionRepository');
const rolePermissionRepository = require('../../infrastructure/repositories/RolePermissionRepository');

class RemovePermissionFromRole {
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

    const exists = await rolePermissionRepository.checkPermissionExists(roleId, permissionId);
    if (!exists) {
      throw new Error("This permission is not assigned to this role.");
    }

    await rolePermissionRepository.removePermissionFromRole(roleId, permissionId);

    return {
      message: "Permission removed from role successfully.",
      roleId,
      permissionId
    };
  }
}

module.exports = new RemovePermissionFromRole();
