// src/infrastructure/repositories/ResultSummaryRepository.js
const BaseRepository = require("./BaseRepository");
const ResultSummaryModel = require("../database/models/ResultSummaryModel");
const resultSummaryMapper = require("../mappers/ResultSummaryMapper");

class ResultSummaryRepository extends BaseRepository {
  constructor() {
    super(ResultSummaryModel, resultSummaryMapper);
  }

  async findByAttempt(attemptId) {
    const record = await this.model.findOne({
      where: { attemptId, isDeleted: false }
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}

module.exports = ResultSummaryRepository;
