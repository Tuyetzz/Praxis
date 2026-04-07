// src/infrastructure/mappers/AttemptQuestionMapper.js
const BaseMapper = require('./BaseMapper');
const AttemptQuestion = require('../../domain/entities/AttemptQuestion');

class AttemptQuestionMapper extends BaseMapper {
  constructor() {
    super(AttemptQuestion);
  }

  toDomain(model) {
    if (!model) return null;
    const data = model instanceof Object && model.get ? model.get({ plain: true }) : model;
    return new AttemptQuestion({
      ...data,
      optionOrder: Array.isArray(data.optionOrder) ? data.optionOrder : (data.optionOrder ? JSON.parse(data.optionOrder) : []),
    });
  }

  toPersistence(entity) {
    if (!entity) return null;
    const data = super.toPersistence(entity);
    if (data.optionOrder && typeof data.optionOrder !== 'string') {
      data.optionOrder = JSON.stringify(data.optionOrder);
    }
    return data;
  }
}

module.exports = new AttemptQuestionMapper();
