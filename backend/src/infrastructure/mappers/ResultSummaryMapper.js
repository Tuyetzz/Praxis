// src/infrastructure/mappers/ResultSummaryMapper.js
const BaseMapper = require("./BaseMapper");
const ResultSummaryEntity = require("../../domain/entities/ResultSummary");

class ResultSummaryMapper extends BaseMapper {
  constructor() {
    super(ResultSummaryEntity);
  }

  toDomain(model) {
    const entity = super.toDomain(model);
    return entity;
  }
}

module.exports = new ResultSummaryMapper();
