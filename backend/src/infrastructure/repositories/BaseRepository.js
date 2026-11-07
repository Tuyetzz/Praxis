// src/infrastructure/repositories/BaseRepository.js
class BaseRepository {
  constructor(model, mapper) {
    this.model = model;
    this.mapper = mapper;
  }

  _applyDeletedFilter(where = {}, options = {}) {
    const includeDeleted = options.includeDeleted ?? where.includeDeleted ?? false;
    const onlyDeleted = options.onlyDeleted ?? where.onlyDeleted ?? false;
    const finalWhere = { ...where };

    delete finalWhere.includeDeleted;
    delete finalWhere.onlyDeleted;

    if (onlyDeleted) {
      finalWhere.isDeleted = true;
    } else if (!includeDeleted) {
      finalWhere.isDeleted = false;
    }

    return finalWhere;
  }

  async findAll(filter = {}, options = {}) {
    const finalWhere = this._applyDeletedFilter(filter, options);
    const records = await this.model.findAll({
      where: finalWhere
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findById(id, options = {}) {
    const finalWhere = this._applyDeletedFilter({ id }, options);
    const record = await this.model.findOne({
      where: finalWhere
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async findByIdIncludingDeleted(id) {
    return this.findById(id, { includeDeleted: true });
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

  async restore(id) {
    return await this.model.update({ isDeleted: false }, { where: { id } });
  }

  async hardDelete(id, options = {}) {
    return await this.model.destroy({ where: { id }, ...options });
  }

  async hardDeleteWhere(where = {}, options = {}) {
    return await this.model.destroy({ where, ...options });
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
      attributes = undefined,
      includeDeleted = false,
      onlyDeleted = false
    } = options;

    const finalWhere = this._applyDeletedFilter(where, { includeDeleted, onlyDeleted });

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