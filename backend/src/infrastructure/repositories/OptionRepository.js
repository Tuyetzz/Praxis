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
}

module.exports = OptionRepository;
