// src/infrastructure/repositories/SubjectRepository.js
const BaseRepository = require("./BaseRepository");
const SubjectModel = require("../database/models/SubjectModel");
const subjectMapper = require("../mappers/SubjectMapper");

class SubjectRepository extends BaseRepository {
  constructor() {
    super(SubjectModel, subjectMapper);
  }

  async findBySlug(slug, options = {}) {
    const record = await this.model.findOne({
      where: this._applyDeletedFilter({ slug }, options)
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}

module.exports = SubjectRepository;
