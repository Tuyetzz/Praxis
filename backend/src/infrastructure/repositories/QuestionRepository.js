// src/infrastructure/repositories/QuestionRepository.js
const BaseRepository = require("./BaseRepository");
const QuestionModel = require("../database/models/QuestionModel");
const questionMapper = require("../mappers/QuestionMapper");

class QuestionRepository extends BaseRepository {
  constructor() {
    super(QuestionModel, questionMapper);
  }

  async findBySubject(subjectId, options = {}) {
    const records = await this.model.findAll({
      where: this._applyDeletedFilter({ subjectId }, options)
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findByChapter(chapterId, options = {}) {
    const records = await this.model.findAll({
      where: this._applyDeletedFilter({ chapterId }, options)
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findByIds(questionIds = [], options = {}) {
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return [];
    }
    const { Op } = require("sequelize");
    const records = await this.model.findAll({
      where: this._applyDeletedFilter({ id: { [Op.in]: questionIds } }, options)
    });
    return records.map(record => this.mapper.toDomain(record));
  }
}
module.exports = QuestionRepository;
