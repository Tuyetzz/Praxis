// src/infrastructure/repositories/OptionRepository.js
const BaseRepository = require("./BaseRepository");
const OptionModel = require("../database/models/OptionModel");
const optionMapper = require("../mappers/OptionMapper");

class OptionRepository extends BaseRepository {
  constructor() {
    super(OptionModel, optionMapper);
  }

  async findByQuestion(questionId) {
    const records = await this.model.findAll({
      where: { questionId, isDeleted: false },
      order: [["order", "ASC"]]
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findByQuestionIds(questionIds = []) {
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return [];
    }
    const { Op } = require("sequelize");
    const records = await this.model.findAll({
      where: { questionId: { [Op.in]: questionIds }, isDeleted: false },
      order: [["order", "ASC"]]
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findByQuestionCorrect(questionId) {
    const records = await this.model.findAll({
      where: { questionId, isCorrect: true, isDeleted: false },
      order: [["order", "ASC"]]
    });
    return records.map(record => this.mapper.toDomain(record));
  }
}

module.exports = OptionRepository;
