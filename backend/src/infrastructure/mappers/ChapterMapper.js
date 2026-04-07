// src/infrastructure/mappers/ChapterMapper.js
const BaseMapper = require("./BaseMapper");
const ChapterEntity = require("../../domain/entities/Chapter");

class ChapterMapper extends BaseMapper {
  constructor() {
    super(ChapterEntity);
  }

  toDomain(model) {
    if (!model) return null;
    const data = model instanceof Object && model.get ? model.get({ plain: true }) : model;

    return new ChapterEntity({
      ...data,
      order: data.order !== undefined ? Number(data.order) : 0,
    });
  }
}

module.exports = new ChapterMapper();
