// src/infrastructure/mappers/TypingTextMapper.js
const BaseMapper = require("./BaseMapper");
const TypingTextEntity = require("../../domain/entities/TypingText");

class TypingTextMapper extends BaseMapper {
  constructor() {
    super(TypingTextEntity);
  }

  toDomain(model) {
    const entity = super.toDomain(model);
    return entity;
  }
}

module.exports = new TypingTextMapper();
