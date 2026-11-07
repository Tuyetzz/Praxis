// src/usecases/role/RemovePermissionFromRole.js
class RemovePermissionFromRole {
  constructor({ roleRepository, permissionRepository, rolePermissionRepository }) {
    this.roleRepository = roleRepository;
    this.permissionRepository = permissionRepository;
    this.rolePermissionRepository = rolePermissionRepository;
  }

  async execute(roleId, permissionId) {
    if (!roleId || !permissionId) {
      throw new Error("Role ID and Permission ID are required.");
    }

    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found.");
    }

    const permission = await this.permissionRepository.findById(permissionId);
    if (!permission) {
      throw new Error("Permission not found.");
    }

    const exists = await this.rolePermissionRepository.checkPermissionExists(roleId, permissionId);
    if (!exists) {
      throw new Error("This permission is not assigned to this role.");
    }

    await this.rolePermissionRepository.removePermissionFromRole(roleId, permissionId);

    return {
      message: "Permission removed from role successfully.",
      roleId,
      permissionId
    };
  }
}

module.exports = RemovePermissionFromRole;
