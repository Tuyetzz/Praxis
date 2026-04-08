// src/usecases/role/UpdateRole.js
const roleRepository = require('../../infrastructure/repositories/RoleRepository');

class UpdateRole {
  async execute(roleId, data, userId = null) {
    if (!roleId) {
      throw new Error("Role ID is required.");
    }

    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found.");
    }

    const { name, description } = data;

    if (name && name.trim() !== role.name) {
      const existing = await roleRepository.findByName(name.trim());
      if (existing) {
        throw new Error("Role with this name already exists.");
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;

    const updatedRole = await roleRepository.update(roleId, updateData, userId);

    return {
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
      updatedAt: updatedRole.updatedAt
    };
  }
}

module.exports = new UpdateRole();
