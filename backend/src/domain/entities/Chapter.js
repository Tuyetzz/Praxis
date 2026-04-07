// src/domain/entities/Chapter.js
const BaseEntity = require("./BaseEntity");

class Chapter extends BaseEntity {
  constructor(data) {
    super(data);
    this.subjectId = data.subjectId;
    this.name = data.name;
    this.order = data.order || 0;
  }

  getDisplayName() {
    return `Chương ${this.order}: ${this.name}`;
  }

  updateOrder(newOrder) {
    if (newOrder < 0) throw new Error("Thứ tự không thể âm");
    this.order = newOrder;
  }
}

module.exports = Chapter;