
// src/infrastructure/mappers/AttemptMapper.js
const BaseMapper = require('./BaseMapper');
const Attempt = require('../../domain/entities/Attempt');

class AttemptMapper extends BaseMapper {
  constructor() {
    super(Attempt);
  }
  toDomain(model) {
    if (!model) return null;

    const data = model instanceof Object && model.get ? model.get({ plain: true }) : model;

    return new Attempt({
      ...data,
      settings: typeof data.settings === 'string' ? JSON.parse(data.settings) : (data.settings || {}),

      startedAt: data.startedAt ? new Date(data.startedAt) : null,
      submittedAt: data.submittedAt ? new Date(data.submittedAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    });
  }
  toPersistence(entity) {
    if (!entity) return null;

    const data = super.toPersistence(entity);

    if (data.settings && typeof data.settings === 'object') {
    }

    return data;
  }
}

module.exports = AttemptMapper;
