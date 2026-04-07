// src/infrastructure/mappers/FlashcardMapper.js
const BaseMapper = require("./BaseMapper");
const FlashcardEntity = require("../../domain/entities/Flashcard");

class FlashcardMapper extends BaseMapper {
  constructor() {
    super(FlashcardEntity);
  }

  toDomain(model) {
    const entity = super.toDomain(model);
    return entity;
  }
}

module.exports = new FlashcardMapper();
