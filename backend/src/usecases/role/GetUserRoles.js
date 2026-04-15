// src/usecases/role/GetUserRoles.js
class GetUserRoles {
  constructor({ userRepository, userRoleRepository }) {
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
  }

  async execute(userId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const roles = await this.userRoleRepository.getRolesForUser(userId);

    return {
      userId,
      userName: user.name,
      roles: roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description
      }))
    };
  }
}

module.exports = GetUserRoles;
