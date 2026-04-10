// src/usecases/role/DeleteRole.js
const roleRepository = require('../../infrastructure/repositories/RoleRepository');
const redisClient = require('../../infrastructure/cache/redisClient');

class DeleteRole {
  async execute(roleId) {
    if (!roleId) {
      throw new Error("Role ID is required.");
    }

    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found.");
    }

    await roleRepository.softDelete(roleId);

    // Clear all user permissions cache since a role has been deleted
    await redisClient.delPattern('user_permissions:*');
  }
}

module.exports = new DeleteRole();
