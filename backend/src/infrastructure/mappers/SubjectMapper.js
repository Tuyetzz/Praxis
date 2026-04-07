// src/infrastructure/mappers/SubjectMapper.js
const BaseMapper = require("./BaseMapper");
const SubjectEntity = require("../../domain/entities/Subject");

class SubjectMapper extends BaseMapper {
  constructor() {
    super(SubjectEntity);
  }

  toDomain(model) {
    const entity = super.toDomain(model);
    return entity;
  }
}

module.exports = new SubjectMapper();
