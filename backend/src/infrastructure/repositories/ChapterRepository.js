// src/infrastructure/repositories/ChapterRepository.js
const BaseRepository = require("./BaseRepository");
const ChapterModel = require("../database/models/ChapterModel");
const QuestionModel = require("../database/models/QuestionModel");
const chapterMapper = require("../mappers/ChapterMapper");

class ChapterRepository extends BaseRepository {
  constructor() {
    super(ChapterModel, chapterMapper);
  }

  async findBySubject(subjectId, options = {}) {
    const records = await this.model.findAll({
      where: this._applyDeletedFilter({ subjectId }, options),
      order: [["order", "ASC"]]
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findBySubjectAndOrder(subjectId, order, options = {}) {
    const record = await this.model.findOne({
      where: this._applyDeletedFilter({ subjectId, order }, options)
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async existsBySubjectAndId(subjectId, id, options = {}) {
    const count = await this.model.count({
      where: this._applyDeletedFilter({ subjectId, id }, options)
    });
    return count > 0;
  }

  async countQuestionsByChapterId(chapterId, options = {}) {
    try {
      const count = await QuestionModel.count({
        where: this._applyDeletedFilter({ chapterId: chapterId }, options)
      });
      return count;
    } catch (error) {
      throw new Error(`Error counting questions for chapter ${chapterId}: ${error.message}`);
    }
  }
}

module.exports = ChapterRepository;
