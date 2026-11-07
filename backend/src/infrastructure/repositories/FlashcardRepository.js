// src/infrastructure/repositories/FlashcardRepository.js
const BaseRepository = require("./BaseRepository");
const FlashcardModel = require("../database/models/FlashcardModel");
const flashcardMapper = require("../mappers/FlashcardMapper");

class FlashcardRepository extends BaseRepository {
  constructor() {
    super(FlashcardModel, flashcardMapper);
  }

  async findByDeck(deckId) {
    const records = await this.model.findAll({
      where: { deckId, isDeleted: false },
      order: [["order", "ASC"]]
    });
    return records.map(record => this.mapper.toDomain(record));
  }
}

module.exports = FlashcardRepository;
