// src/infrastructure/mappers/AuthSessionMapper.js
const BaseMapper = require('./BaseMapper');
const AuthSession = require('../../domain/entities/AuthSession');

class AuthSessionMapper extends BaseMapper {
  constructor() {
    super(AuthSession);
  }

  toDomain(model) {
    if (!model) return null;
    const data = model instanceof Object && model.get ? model.get({ plain: true }) : model;
    return new AuthSession({
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      revokedAt: data.revokedAt ? new Date(data.revokedAt) : null,
    });
  }

  toPersistence(entity) {
    if (!entity) return null;
    const data = super.toPersistence(entity);
    return data;
  }
}

module.exports = new AuthSessionMapper();
