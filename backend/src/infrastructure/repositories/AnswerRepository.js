// src/infrastructure/repositories/AnswerRepository.js
const BaseRepository = require("./BaseRepository");
const AnswerModel = require("../database/models/AnswerModel");
const answerMapper = require("../mappers/AnswerMapper");

class AnswerRepository extends BaseRepository {
  constructor() {
    super(AnswerModel, answerMapper);
  }

  async findByAttempt(attemptId) {
    const records = await this.model.findAll({ 
      where: { attemptId, isDeleted: false } 
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findByAttemptAndQuestion(attemptId, questionId) {
    const record = await this.model.findOne({
      where: { attemptId, questionId, isDeleted: false }
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async findByAttemptId(attemptId) {
    const records = await this.model.findAll({
      where: { attemptId, isDeleted: false }
    });
    return records.map(record => this.mapper.toDomain(record));
  }
}

module.exports = AnswerRepository;