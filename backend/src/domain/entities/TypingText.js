// src/domain/entities/TypingText.js
const BaseEntity = require("./BaseEntity");
const TYPING_TEXT_TYPE_ENUM = require("../constants/typing_text_type_enum");

class TypingText extends BaseEntity {
  constructor(data) {
    super(data);
    this.authorId = data.authorId;
    this.title = data.title;
    this.content = data.content;
    this.language = data.language || 'vietnamese';
    this.isPublic = data.isPublic || false;
    this.isDefault = data.isDefault || false;
    this.difficulty = data.difficulty || 'medium';
    this.sourceType = data.sourceType || TYPING_TEXT_TYPE_ENUM.MANUAL;

    this.validate();
  }

  validate() {
    if (!this.content || this.content.trim().length < 10) {
      throw new Error("Nội dung luyện gõ quá ngắn (tối thiểu 10 ký tự).");
    }
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(this.difficulty)) {
      throw new Error("Độ khó không hợp lệ.");
    }
    const validSourceTypes = Object.values(TYPING_TEXT_TYPE_ENUM);
    if (!validSourceTypes.includes(this.sourceType)) {
      throw new Error("Nguồn nội dung không hợp lệ.");
    }
  }

  getWordCount() {
    return this.content.split(/\s+/).length;
  }
}

module.exports = TypingText;