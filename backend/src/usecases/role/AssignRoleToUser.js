// src/usecases/role/AssignRoleToUser.js
const roleRepository = require('../../infrastructure/repositories/RoleRepository');
const userRepository = require('../../infrastructure/repositories/UserRepository');
const userRoleRepository = require('../../infrastructure/repositories/UserRoleRepository');

class AssignRoleToUser {
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

    const alreadyExists = await userRoleRepository.checkRoleExists(userId, roleId);
    if (alreadyExists) {
      throw new Error("This role is already assigned to this user.");
    }

    await userRoleRepository.assignRoleToUser(userId, roleId);

    return {
      message: "Role assigned to user successfully.",
      userId,
      roleId
    };
  }
}

module.exports = new AssignRoleToUser();
