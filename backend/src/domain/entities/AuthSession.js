// src/domain/entities/AuthSession.js
const BaseEntity = require("./BaseEntity");

class AuthSession extends BaseEntity {
  constructor(data) {
    super(data);
    this.userId = data.userId;
    this.refreshToken = data.refreshToken;
    this.userAgent = data.userAgent;
    this.ip = data.ip;
    this.expiresAt = data.expiresAt;
    this.revokedAt = data.revokedAt || null;
  }

  isValid() {
    const now = new Date();
    return !this.revokedAt && new Date(this.expiresAt) > now && !this.isDeleted;
  }

  // Logic nghiệp vụ: Thu hồi session
  revoke() {
    this.revokedAt = new Date();
  }
}

module.exports = AuthSession;