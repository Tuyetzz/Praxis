// src/infrastructure/mappers/QuestionMapper.js
const BaseMapper = require("./BaseMapper");
const QuestionEntity = require("../../domain/entities/Question");

class QuestionMapper extends BaseMapper {
  constructor() {
    super(QuestionEntity);
  }

  toDomain(model) {
    const entity = super.toDomain(model);
    return entity;
  }
}

module.exports = new QuestionMapper();
