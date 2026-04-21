// src/infrastructure/repositories/BaseRepository.js
class BaseRepository {
  constructor(model, mapper) {
    this.model = model;
    this.mapper = mapper;
  }

  async findAll(filter = {}) {
    const records = await this.model.findAll({ 
      where: { ...filter, isDeleted: false } 
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findById(id) {
    const record = await this.model.findOne({ 
      where: { id, isDeleted: false } 
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async create(data, userId = null, options = {}) {
    const payload = { ...data, createdBy: userId };
    const record = await this.model.create(payload, options);
    return this.mapper.toDomain(record);
  }

  async update(id, data, userId = null, options = {}) {
    const payload = { ...data, updatedBy: userId };
    const [affectedCount] = await this.model.update(payload, { where: { id }, ...options });
    
    if (affectedCount === 0) return null;
    
    return this.findById(id);
  }

  async softDelete(id) {
    return await this.model.update({ isDeleted: true }, { where: { id } });
  }

  async findWithPagination(options = {}) {
    const {
      limit = 10,
      offset = 0,
      search = null,
      searchFields = [],
      order = [["createdAt", "DESC"]],
      where = {},
      include = [],
      attributes = undefined
    } = options;

    // Add soft-delete filter by default
    const finalWhere = { ...where, isDeleted: false };

    // If search is provided, add OR conditions for search fields
    if (search && searchFields.length > 0) {
      const { Op } = require("sequelize");
      finalWhere[Op.or] = searchFields.map(field => ({
        [field]: { [Op.like]: `%${search}%` }
      }));
    }

    const { rows, count } = await this.model.findAndCountAll({
      where: finalWhere,
      limit,
      offset,
      order,
      include,
      attributes,
      distinct: true
    });

    const data = rows.map(record => this.mapper.toDomain(record));

    return {
      data,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Math.floor(offset / limit) + 1,
      itemsPerPage: limit
    };
  }
}

module.exports = BaseRepository;