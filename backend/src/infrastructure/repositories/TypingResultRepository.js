// src/infrastructure/repositories/TypingResultRepository.js
const BaseRepository = require("./BaseRepository");
const TypingResultModel = require("../database/models/TypingResultModel");
const typingResultMapper = require("../mappers/TypingResultMapper");

class TypingResultRepository extends BaseRepository {
  constructor() {
    super(TypingResultModel, typingResultMapper);
  }

  async findByUser(userId) {
    const records = await this.model.findAll({
      where: { userId, isDeleted: false }
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findByText(textId) {
    const records = await this.model.findAll({
      where: { textId, isDeleted: false }
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findLeaderboardByText(textId, limit = 10) {
    const records = await this.model.findAll({
      where: { textId, isDeleted: false },
      order: [
        ['wpm', 'DESC'],
        ['accuracy', 'DESC'],
        ['createdAt', 'ASC']
      ],
      limit
    });

    return records.map((record) => this.mapper.toDomain(record));
  }

  async hardDeleteByTextId(textId, options = {}) {
    return await this.hardDeleteWhere({ textId }, options);
  }
}

module.exports = TypingResultRepository;
