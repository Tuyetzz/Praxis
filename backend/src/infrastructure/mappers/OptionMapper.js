// src/infrastructure/mappers/OptionMapper.js
const BaseMapper = require("./BaseMapper");
const OptionEntity = require("../../domain/entities/Option");

class OptionMapper extends BaseMapper {
  constructor() {
    super(OptionEntity);
  }

  toDomain(model) {
    const entity = super.toDomain(model);
    // Có thể bổ sung xử lý nếu cần
    return entity;
  }
}

module.exports = new OptionMapper();
