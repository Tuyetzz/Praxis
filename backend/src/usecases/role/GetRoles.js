// src/usecases/role/GetRoles.js
class GetRoles {
  constructor({ roleRepository }) {
    this.roleRepository = roleRepository;
  }

  async execute(params = {}) {
    const { page = 1, limit = 10, search = '' } = params;
    
    let filter = {};
    if (search) {
      filter.name = { [require('sequelize').Op.like]: `%${search}%` };
    }

    const roles = await this.roleRepository.findAll(filter);
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRoles = roles.slice(start, end);

    return {
      data: paginatedRoles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
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
