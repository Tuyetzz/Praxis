// src/usecases/role/CreateRole.js
const roleRepository = require('../../infrastructure/repositories/RoleRepository');

class CreateRole {
  async execute(data, userId = null) {
    const { name, description } = data;

    if (!name || !name.trim()) {
      throw new Error("Role name is required.");
    }

    const existing = await roleRepository.findByName(name.trim());
    if (existing) {
      throw new Error("Role with this name already exists.");
    }

    const newRole = await roleRepository.create({
      name: name.trim(),
      description: description || null
    }, userId);

    return {
      id: newRole.id,
      name: newRole.name,
      description: newRole.description,
      createdAt: newRole.createdAt
    };
  }
}

module.exports = new CreateRole();
