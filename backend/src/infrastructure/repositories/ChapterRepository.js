// src/infrastructure/repositories/ChapterRepository.js
const BaseRepository = require("./BaseRepository");
const ChapterModel = require("../database/models/ChapterModel");
const chapterMapper = require("../mappers/ChapterMapper");

class ChapterRepository extends BaseRepository {
  constructor() {
    super(ChapterModel, chapterMapper);
  }

  async findBySubject(subjectId) {
    const records = await this.model.findAll({
      where: { subjectId, isDeleted: false },
      order: [["order", "ASC"]]
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findBySubjectAndOrder(subjectId, order) {
    const record = await this.model.findOne({
      where: { subjectId, order, isDeleted: false }
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}

module.exports = new ChapterRepository();
