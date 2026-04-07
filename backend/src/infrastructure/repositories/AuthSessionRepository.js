// src/infrastructure/repositories/AuthSessionRepository.js
const BaseRepository = require('./BaseRepository');
const AuthSessionModel = require('../database/models/AuthSessionModel');
const authSessionMapper = require('../mappers/AuthSessionMapper');

class AuthSessionRepository extends BaseRepository {
  constructor() {
    super(AuthSessionModel, authSessionMapper);
  }

  async findByUser(userId) {
    const records = await this.model.findAll({
      where: { userId, isDeleted: false }
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findByRefreshToken(refreshToken) {
    const record = await this.model.findOne({
      where: { refreshToken, isDeleted: false }
    });
    return this.mapper.toDomain(record);
  }

  async revokeToken(refreshToken) {
    return await this.model.update(
      { revokedAt: new Date() }, 
      { where: { refreshToken } }
    );
  }

  async revokeAllUserSessions(userId) {
    return await this.model.update(
      { revokedAt: new Date() },
      { where: { userId, revokedAt: null } }
    );
  }
}

module.exports = new AuthSessionRepository();
