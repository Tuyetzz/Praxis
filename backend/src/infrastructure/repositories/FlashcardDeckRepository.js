// src/infrastructure/repositories/FlashcardDeckRepository.js
const BaseRepository = require("./BaseRepository");
const FlashcardDeckModel = require("../database/models/FlashcardDeckModel");
const flashcardDeckMapper = require("../mappers/FlashcardDeckMapper");

class FlashcardDeckRepository extends BaseRepository {
  constructor() {
    super(FlashcardDeckModel, flashcardDeckMapper);
  }

  async findByUser(userId) {
    const records = await this.model.findAll({
      where: { userId, isDeleted: false }
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findPublicDecks() {
    const records = await this.model.findAll({
      where: { isPublic: true, isDeleted: false }
    });
    return records.map(record => this.mapper.toDomain(record));
  }
}

module.exports = new FlashcardDeckRepository();
