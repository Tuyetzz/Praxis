// src/infrastructure/mappers/TypingResultMapper.js
const BaseMapper = require("./BaseMapper");
const TypingResultEntity = require("../../domain/entities/TypingResult");

class TypingResultMapper extends BaseMapper {
  constructor() {
    super(TypingResultEntity);
  }

  toDomain(model) {
    const entity = super.toDomain(model);
    return entity;
  }
}

module.exports = new TypingResultMapper();
