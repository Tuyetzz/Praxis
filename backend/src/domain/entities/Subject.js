// src/domain/entities/Subject.js
const BaseEntity = require("./BaseEntity");

class Subject extends BaseEntity {
  constructor(data) {
    super(data); // Đẩy id, audit fields lên Base
    this.name = data.name;
    this.slug = data.slug;
    this.order = data.order || 0;
    
    this.validate();
  }

  validate() {
    if (!this.name || this.name.length < 2) {
      throw new Error("Tên môn học phải có ít nhất 2 ký tự.");
    }
    if (!this.slug || !/^[a-z0-9-]+$/.test(this.slug)) {
      throw new Error("Slug không hợp lệ (chỉ chứa chữ thường, số và dấu gạch ngang).");
    }
  }

  updateName(newName) {
    this.name = newName;
  }
}

module.exports = Subject;