// src/domain/entities/BaseEntity.js
class BaseEntity {
  constructor({ id, createdAt, updatedAt, createdBy, updatedBy, isDeleted }) {
    if (this.constructor === BaseEntity) {
      throw new Error("Không thể khởi tạo trực tiếp BaseEntity.");
    }
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
    this.isDeleted = isDeleted || false;
  }
}

module.exports = BaseEntity;