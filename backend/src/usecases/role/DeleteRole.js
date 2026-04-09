// src/usecases/role/DeleteRole.js
const roleRepository = require('../../infrastructure/repositories/RoleRepository');

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
  }
}

module.exports = new DeleteRole();
