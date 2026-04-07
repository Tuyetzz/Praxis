// src/infrastructure/repositories/SubjectRepository.js
const BaseRepository = require("./BaseRepository");
const SubjectModel = require("../database/models/SubjectModel");
const subjectMapper = require("../mappers/SubjectMapper");

class SubjectRepository extends BaseRepository {
  constructor() {
    super(SubjectModel, subjectMapper);
  }

  async findBySlug(slug) {
    const record = await this.model.findOne({
      where: { slug, isDeleted: false }
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}

module.exports = new SubjectRepository();
