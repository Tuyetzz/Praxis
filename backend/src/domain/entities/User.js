// src/domain/entities/User.js
const BaseEntity = require("./BaseEntity");

class User extends BaseEntity {
  constructor(data) {
    super(data);
    this.name = data.name;
    this.email = data.email ? data.email.trim().toLowerCase() : null;
    this.passwordHash = data.passwordHash;
    this.status = data.status || 'active';
    this.avatarUrl = data.avatarUrl || null;
    this.lastLoginAt = data.lastLoginAt || null;

    this.validate();
  }

  validate() {
    if (!this.email || !this.email.includes('@')) {
      throw new Error("Email không hợp lệ.");
    }
    if (this.name && this.name.length < 2) {
      throw new Error("Tên người dùng quá ngắn.");
    }
  }

  isActive() {
    return this.status === 'active' && !this.isDeleted;
  }

  recordLogin() {
    this.lastLoginAt = new Date();
  }
}

module.exports = User;