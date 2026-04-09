// src/usecases/role/GetOneRole.js
const roleRepository = require('../../infrastructure/repositories/RoleRepository');

class GetOneRole {
  async execute(roleId) {
    if (!roleId) {
      throw new Error("Role ID is required.");
    }

    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found.");
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    };
  }
}

module.exports = new GetOneRole();
