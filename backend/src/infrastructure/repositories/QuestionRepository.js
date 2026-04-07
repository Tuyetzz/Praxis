// src/infrastructure/repositories/QuestionRepository.js
const BaseRepository = require("./BaseRepository");
const QuestionModel = require("../database/models/QuestionModel");
const questionMapper = require("../mappers/QuestionMapper");

class QuestionRepository extends BaseRepository {
  constructor() {
    super(QuestionModel, questionMapper);
  }

  async findBySubject(subjectId) {
    const records = await this.model.findAll({
      where: { subjectId, isDeleted: false }
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findByChapter(chapterId) {
    const records = await this.model.findAll({
      where: { chapterId, isDeleted: false }
    });
    return records.map(record => this.mapper.toDomain(record));
  }
}

module.exports = new QuestionRepository();
