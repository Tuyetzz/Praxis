// src/infrastructure/mappers/AnswerMapper.js
const BaseMapper = require("./BaseMapper");
const AnswerEntity = require("../../domain/entities/Answer");

class AnswerMapper extends BaseMapper {
  constructor() {
    super(AnswerEntity);
  }

  toDomain(model) {
    const entity = super.toDomain(model);
    if (entity && !entity.selectedOptionIds) {
      entity.selectedOptionIds = [];
    }
    return entity;
  }
}

module.exports = new AnswerMapper();