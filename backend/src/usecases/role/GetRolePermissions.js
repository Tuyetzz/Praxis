// src/usecases/role/GetRolePermissions.js
const roleRepository = require('../../infrastructure/repositories/RoleRepository');
const rolePermissionRepository = require('../../infrastructure/repositories/RolePermissionRepository');

class GetRolePermissions {
  async execute(roleId) {
    if (!roleId) {
      throw new Error("Role ID is required.");
    }

    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found.");
    }

    const permissions = await rolePermissionRepository.getPermissionsForRole(roleId);

    return {
      roleId,
      roleName: role.name,
      permissions: permissions.map(permission => ({
        id: permission.id,
        name: permission.name,
        slug: permission.slug,
        description: permission.description
      }))
    };
  }
}

module.exports = new GetRolePermissions();
