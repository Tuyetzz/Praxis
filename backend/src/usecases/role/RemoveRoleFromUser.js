// src/usecases/role/RemoveRoleFromUser.js
const roleRepository = require('../../infrastructure/repositories/RoleRepository');
const userRepository = require('../../infrastructure/repositories/UserRepository');
const userRoleRepository = require('../../infrastructure/repositories/UserRoleRepository');

class RemoveRoleFromUser {
  async execute(userId, roleId) {
    if (!userId || !roleId) {
      throw new Error("User ID and Role ID are required.");
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found.");
    }

    const exists = await userRoleRepository.checkRoleExists(userId, roleId);
    if (!exists) {
      throw new Error("This role is not assigned to this user.");
    }

    await userRoleRepository.removeRoleFromUser(userId, roleId);

    return {
      message: "Role removed from user successfully.",
      userId,
      roleId
    };
  }
}

module.exports = new RemoveRoleFromUser();
