// src/infrastructure/repositories/TypingTextRepository.js
const BaseRepository = require("./BaseRepository");
const TypingTextModel = require("../database/models/TypingTextModel");
const typingTextMapper = require("../mappers/TypingTextMapper");

class TypingTextRepository extends BaseRepository {
  constructor() {
    super(TypingTextModel, typingTextMapper);
  }

  async findPublicTexts() {
    const records = await this.model.findAll({
      where: { isPublic: true, isDeleted: false }
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findByAuthor(authorId) {
    const records = await this.model.findAll({
      where: { authorId, isDeleted: false }
    });
    return records.map(record => this.mapper.toDomain(record));
  }
}

module.exports = TypingTextRepository;
