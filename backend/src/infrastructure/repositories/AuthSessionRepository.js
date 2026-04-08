// src/infrastructure/repositories/AuthSessionRepository.js
const AuthSessionModel = require('../database/models/AuthSessionModel');
const authSessionMapper = require('../mappers/AuthSessionMapper');

class AuthSessionRepository {
  constructor() {
    this.model = AuthSessionModel;
    this.mapper = authSessionMapper;
  }

  async create(authSessionEntity) {
    const persistenceData = this.mapper.toPersistence(authSessionEntity);
    
    const record = await this.model.create(persistenceData);
    
    return this.mapper.toDomain(record);
  }

  async update(id, authSessionEntity) {
    const persistenceData = this.mapper.toPersistence(authSessionEntity);
    await this.model.update(persistenceData, { where: { id } });
    const updatedRecord = await this.model.findByPk(id);
    return this.mapper.toDomain(updatedRecord);
  }

  async findByUser(userId) {
    const records = await this.model.findAll({
      where: { userId, revokedAt: null }
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findByRefreshToken(refreshToken) {
    const record = await this.model.findOne({
      where: { refreshToken, revokedAt: null }
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
