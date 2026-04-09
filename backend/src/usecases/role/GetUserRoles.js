// src/usecases/role/GetUserRoles.js
const userRepository = require('../../infrastructure/repositories/UserRepository');
const userRoleRepository = require('../../infrastructure/repositories/UserRoleRepository');

class GetUserRoles {
  async execute(userId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const roles = await userRoleRepository.getRolesForUser(userId);

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

module.exports = new GetUserRoles();
