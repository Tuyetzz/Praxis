// src/usecases/role/RestoreRole.js
class RestoreRole {
  constructor({ roleRepository, redisClient }) {
    this.roleRepository = roleRepository;
    this.redisClient = redisClient;
  }

  async execute(roleId) {
    if (!roleId) {
      throw new Error("Role ID is required.");
    }

    const role = await this.roleRepository.findByIdIncludingDeleted(roleId);
    if (!role) {
      throw new Error("Role not found.");
    }

    await this.roleRepository.restore(roleId);

    await this.redisClient.delPattern('user_permissions:*');
  }
}

module.exports = RestoreRole;
