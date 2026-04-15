// src/usecases/role/RemoveRoleFromUser.js
class RemoveRoleFromUser {
  constructor({ roleRepository, userRepository, userRoleRepository }) {
    this.roleRepository = roleRepository;
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
  }

  async execute(userId, roleId) {
    if (!userId || !roleId) {
      throw new Error("User ID and Role ID are required.");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found.");
    }

    const exists = await this.userRoleRepository.checkRoleExists(userId, roleId);
    if (!exists) {
      throw new Error("This role is not assigned to this user.");
    }

    await this.userRoleRepository.removeRoleFromUser(userId, roleId);

    return {
      message: "Role removed from user successfully.",
      userId,
      roleId
    };
  }
}

module.exports = RemoveRoleFromUser;
