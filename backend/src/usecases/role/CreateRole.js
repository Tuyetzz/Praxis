// src/usecases/role/CreateRole.js
const roleRepository = require('../../infrastructure/repositories/RoleRepository');

class CreateRole {
  async execute(data, userId = null) {
    const { name, description } = data;

    if (!name || !name.trim()) {
      throw new Error("Role name is required.");
    }

    const trimmedName = name.trim();
    const existing = await roleRepository.findByName(trimmedName);
    if (existing) {
      throw new Error("Role with this name already exists.");
    }
    let newRole;
    try {
      newRole = await roleRepository.create({
        name: trimmedName,
        description: description || null
      }, userId);
    } catch (error) {
      const message = error && error.message ? error.message.toLowerCase() : '';
      const code = error && error.code ? error.code : '';
      const isUniqueConstraintError =
        code === '23505' ||
        code === 'ER_DUP_ENTRY' ||
        message.includes('unique constraint') ||
        message.includes('duplicate entry') ||
        message.includes('already exists');
      if (isUniqueConstraintError) {
        throw new Error("Role with this name already exists.");
      }
      throw error;
    }

    return {
      id: newRole.id,
      name: newRole.name,
      description: newRole.description,
      createdAt: newRole.createdAt
    };
  }
}

module.exports = new CreateRole();
