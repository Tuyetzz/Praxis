// src/infrastructure/repositories/AttemptQuestionRepository.js
const BaseRepository = require('./BaseRepository');
const AttemptQuestionModel = require('../database/models/AttemptQuestionModel');
const attemptQuestionMapper = require('../mappers/AttemptQuestionMapper');

class AttemptQuestionRepository extends BaseRepository {
  constructor() {
    super(AttemptQuestionModel, attemptQuestionMapper);
  }

  async findByAttempt(attemptId) {
    const records = await this.model.findAll({
      where: { attemptId, isDeleted: false }
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findByQuestion(questionId) {
    const records = await this.model.findAll({
      where: { questionId, isDeleted: false }
    });
    return records.map(record => this.mapper.toDomain(record));
  }
}

module.exports = new AttemptQuestionRepository();
