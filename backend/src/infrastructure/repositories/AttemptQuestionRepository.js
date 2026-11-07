// src/infrastructure/repositories/AttemptQuestionRepository.js
const BaseRepository = require('./BaseRepository');
const AttemptQuestionModel = require('../database/models/AttemptQuestionModel');
const attemptQuestionMapper = require('../mappers/AttemptQuestionMapper');

class AttemptQuestionRepository extends BaseRepository {
  constructor() {
    super(AttemptQuestionModel, attemptQuestionMapper);
  }

  async createMany(items = [], userId = null, options = {}) {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    const payload = items.map((item) => ({
      ...item,
      createdBy: userId,
      updatedBy: userId,
    }));

    const records = await this.model.bulkCreate(payload, options);
    return records.map((record) => this.mapper.toDomain(record));
  }

  async findByAttempt(attemptId) {
    const records = await this.model.findAll({
      where: { attemptId, isDeleted: false },
      order: [["sequence", "ASC"], ["pageIndex", "ASC"]]
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findByQuestion(questionId) {
    const records = await this.model.findAll({
      where: { questionId, isDeleted: false }
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async hardDeleteByAttemptId(attemptId, options = {}) {
    return await this.hardDeleteWhere({ attemptId }, options);
  }
}

module.exports = AttemptQuestionRepository;
