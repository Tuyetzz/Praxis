// src/usecases/role/AssignPermissionToRole.js
class AssignPermissionToRole {
  constructor({ roleRepository, permissionRepository, rolePermissionRepository, redisClient }) {
    this.roleRepository = roleRepository;
    this.permissionRepository = permissionRepository;
    this.rolePermissionRepository = rolePermissionRepository;
    this.redisClient = redisClient;
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

    const alreadyExists = await this.rolePermissionRepository.checkPermissionExists(roleId, permissionId);
    if (alreadyExists) {
      throw new Error("This permission is already assigned to this role.");
    }

    await this.rolePermissionRepository.assignPermissionToRole(roleId, permissionId);

    // Clear all user permissions cache since roles have changed
    await this.redisClient.delPattern('user_permissions:*');

    return {
      message: "Permission assigned to role successfully.",
      roleId,
      permissionId
    };
  }
}

module.exports = AssignPermissionToRole;
