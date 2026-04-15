// src/usecases/role/UpdateRole.js
class UpdateRole {
  constructor({ roleRepository }) {
    this.roleRepository = roleRepository;
  }

  async execute(roleId, data, userId = null) {
    if (!roleId) {
      throw new Error("Role ID is required.");
    }

    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found.");
    }

    const { name, description } = data;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        throw new Error("Role name must be a non-empty string.");
      }
      if (name.trim() !== role.name) {
        const existing = await this.roleRepository.checkRoleNameExists(name.trim());
        if (existing) {
          throw new Error("Role with this name already exists.");
        }
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;

    const updatedRole = await this.roleRepository.update(roleId, updateData, userId);

    return {
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
      updatedAt: updatedRole.updatedAt
    };
  }
}

module.exports = UpdateRole;
