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

  async create(data, userId = null) {
    const payload = { ...data, createdBy: userId };
    const record = await this.model.create(payload);
    return this.mapper.toDomain(record);
  }

  async update(id, data, userId = null) {
    const payload = { ...data, updatedBy: userId };
    const [affectedCount] = await this.model.update(payload, { where: { id } });
    
    if (affectedCount === 0) return null;
    
    return this.findById(id);
  }

  async softDelete(id) {
    return await this.model.update({ isDeleted: true }, { where: { id } });
  }
}

module.exports = BaseRepository;