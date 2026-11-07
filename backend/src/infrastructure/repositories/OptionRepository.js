// src/infrastructure/repositories/OptionRepository.js
const BaseRepository = require("./BaseRepository");
const OptionModel = require("../database/models/OptionModel");
const optionMapper = require("../mappers/OptionMapper");

class OptionRepository extends BaseRepository {
  constructor() {
    super(OptionModel, optionMapper);
  }

  async findByQuestion(questionId, options = {}) {
    const records = await this.model.findAll({
      where: this._applyDeletedFilter({ questionId }, options),
      order: [["order", "ASC"]]
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findByQuestionIds(questionIds = [], options = {}) {
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return [];
    }
    const { Op } = require("sequelize");
    const records = await this.model.findAll({
      where: this._applyDeletedFilter({ questionId: { [Op.in]: questionIds } }, options),
      order: [["order", "ASC"]]
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findByQuestionCorrect(questionId, options = {}) {
    const records = await this.model.findAll({
      where: this._applyDeletedFilter({ questionId, isCorrect: true }, options),
      order: [["order", "ASC"]]
    });
    return records.map(record => this.mapper.toDomain(record));
  }
}

module.exports = OptionRepository;
