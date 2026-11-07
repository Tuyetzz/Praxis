// src/usecases/role/DeleteRole.js
class DeleteRole {
  constructor({ roleRepository, redisClient }) {
    this.roleRepository = roleRepository;
    this.redisClient = redisClient;
  }

  async execute(roleId) {
    if (!roleId) {
      throw new Error("Role ID is required.");
    }

    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found.");
    }

    await this.roleRepository.softDelete(roleId);

    // Clear all user permissions cache since a role has been deleted
    await this.redisClient.delPattern('user_permissions:*');
  }
}

module.exports = DeleteRole;
