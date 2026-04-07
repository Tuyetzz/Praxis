// src/infrastructure/mappers/FlashcardDeckMapper.js
const BaseMapper = require("./BaseMapper");
const FlashcardDeckEntity = require("../../domain/entities/FlashcardDeck");

class FlashcardDeckMapper extends BaseMapper {
  constructor() {
    super(FlashcardDeckEntity);
  }

  toDomain(model) {
    const entity = super.toDomain(model);
    return entity;
  }
}

module.exports = new FlashcardDeckMapper();
