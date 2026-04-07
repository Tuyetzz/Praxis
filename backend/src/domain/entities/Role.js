// src/domain/entities/Role.js
const BaseEntity = require("./BaseEntity");

class Role extends BaseEntity {
  constructor(data) {
    super(data);
    this.name = data.name; 
    this.description = data.description;

    this.validate();
  }

  validate() {
    if (!this.name || this.name.trim().length < 2) {
      throw new Error("Tên Role phải có ít nhất 2 ký tự.");
    }
  }

  isSuperAdmin() {
    return this.name.toUpperCase() === 'ADMIN';
  }

  getNormalizedName() {
    return this.name.toUpperCase().replace(/\s+/g, '_');
  }
}

module.exports = Role;