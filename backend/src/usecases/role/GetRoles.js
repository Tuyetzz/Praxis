// src/usecases/role/GetRoles.js
class GetRoles {
  constructor({ roleRepository }) {
    this.roleRepository = roleRepository;
  }

  async execute(params = {}) {
    const { page = 1, limit = 10, search = '', includeDeleted, onlyDeleted } = params;
    const includeDeletedFlag = includeDeleted === true || includeDeleted === 'true' || includeDeleted === '1';
    const onlyDeletedFlag = onlyDeleted === true || onlyDeleted === 'true' || onlyDeleted === '1';
    
    let filter = {};
    if (search) {
      filter.name = { [require('sequelize').Op.like]: `%${search}%` };
    }

    const roles = await this.roleRepository.findAll(filter, {
      includeDeleted: includeDeletedFlag,
      onlyDeleted: onlyDeletedFlag
    });
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRoles = roles.slice(start, end);

    return {
      data: paginatedRoles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        isDeleted: role.isDeleted
      })),
      pagination: {
        page,
        limit,
        total: roles.length,
        totalPages: Math.ceil(roles.length / limit)
      }
    };
  }
}

module.exports = GetRoles;
