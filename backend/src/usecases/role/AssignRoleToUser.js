// src/usecases/role/AssignRoleToUser.js
class AssignRoleToUser {
  constructor({ roleRepository, userRepository, userRoleRepository, redisClient }) {
    this.roleRepository = roleRepository;
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
    this.redisClient = redisClient;
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

    const alreadyExists = await this.userRoleRepository.checkRoleExists(userId, roleId);
    if (alreadyExists) {
      throw new Error("This role is already assigned to this user.");
    }

    await this.userRoleRepository.assignRoleToUser(userId, roleId);

    // Clear user's permission cache
    await this.redisClient.del(`user_permissions:${userId}`);

    return {
      message: "Role assigned to user successfully.",
      userId,
      roleId
    };
  }
}

module.exports = AssignRoleToUser;
