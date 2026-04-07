// src/domain/entities/Permission.js
const BaseEntity = require("./BaseEntity");

class Permission extends BaseEntity {
  constructor(data) {
    super(data); // Kế thừa id (UUID), createdAt, updatedAt, createdBy, updatedBy, isDeleted
    this.name = data.name; // Ví dụ: "Tạo câu hỏi"
    this.slug = data.slug; // Ví dụ: "question:create"
    this.description = data.description;

    this.validate();
  }

  // Domain Logic: Kiểm tra tính hợp lệ
  validate() {
    if (!this.slug || !this.slug.includes(':')) {
      throw new Error("Permission slug phải theo định dạng 'resource:action' (ví dụ: 'user:edit').");
    }
  }

  parseSlug() {
    const [resource, action] = this.slug.split(':');
    return { resource, action };
  }
}

module.exports = Permission;