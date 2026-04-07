// src/domain/entities/TypingResult.js
const BaseEntity = require("./BaseEntity");

class TypingResult extends BaseEntity {
  constructor(data) {
    super(data); // Kế thừa id, createdAt, updatedAt, createdBy, updatedBy, isDeleted
    this.userId = data.userId;
    this.textId = data.textId;
    this.wpm = data.wpm; // Words Per Minute (đã trừ lỗi)
    this.accuracy = data.accuracy; // % chính xác
    this.rawWpm = data.rawWpm || data.wpm; // WPM chưa trừ lỗi
    this.durationSeconds = data.durationSeconds;
    this.errorTags = data.errorTags || {}; // Ví dụ: { "k": 5, "l": 2 } (phím gõ sai và số lần)

    this.validate();
  }

  validate() {
    if (this.wpm < 0 || this.accuracy < 0 || this.accuracy > 100) {
      throw new Error("Dữ liệu kết quả luyện gõ không hợp lệ.");
    }
  }

  getPerformanceLevel() {
    if (this.wpm < 20) return 'Beginner';
    if (this.wpm < 50) return 'Intermediate';
    if (this.wpm < 80) return 'Advanced';
    return 'Pro Gamer';
  }
}

module.exports = TypingResult;