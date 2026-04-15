// src/usecases/role/GetRolePermissions.js
class GetRolePermissions {
  constructor({ roleRepository, rolePermissionRepository }) {
    this.roleRepository = roleRepository;
    this.rolePermissionRepository = rolePermissionRepository;
  }

  async execute(roleId) {
    if (!roleId) {
      throw new Error("Role ID is required.");
    }

    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found.");
    }

    const permissions = await this.rolePermissionRepository.getPermissionsForRole(roleId);

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

module.exports = GetRolePermissions;
