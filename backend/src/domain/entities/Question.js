// src/domain/entities/Question.js
const BaseEntity = require("./BaseEntity");

class Question extends BaseEntity {
  constructor(data) {
    super(data);
    this.subjectId = data.subjectId;
    this.chapterId = data.chapterId;
    this.type = data.type; // 'single', 'multiple', 'true_false', 'fill_blank'
    this.text = data.text;
    this.explanation = data.explanation;
    this.difficulty = data.difficulty || 1;
    this.points = data.points || 1;
    this.media = data.media || [];
    this.tags = data.tags || [];

    this.validate();
  }

  // Domain Logic: Kiểm tra tính hợp lệ của câu hỏi
  validate() {
    const validTypes = ['single', 'multiple', 'true_false', 'fill_blank'];
    if (!validTypes.includes(this.type)) {
      throw new Error(`Loại câu hỏi ${this.type} không hợp lệ.`);
    }
    if (!this.text || this.text.trim() === "") {
      throw new Error("Nội dung câu hỏi không được để trống.");
    }
  }

  // Domain Logic: Check xem có phải câu hỏi tự luận/điền từ không
  isTextBased() {
    return this.type === 'fill_blank';
  }

  // Domain Logic: Check xem có phải loại chọn nhiều đáp án không
  isMultipleChoice() {
    return this.type === 'multiple';
  }
}

module.exports = Question;