// src/domain/entities/Question.js
const BaseEntity = require("./BaseEntity");
const QUESTIONS_TYPE_ENUM = require("../constants/questions_type_enum");

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

  validate() {
    const validTypes = Object.values(QUESTIONS_TYPE_ENUM);
    if (!validTypes.includes(this.type)) {
      throw new Error(`Question type: ${this.type} is invalid.`);
    }
    if (!this.text || this.text.trim() === "") {
      throw new Error("Question text cannot be empty.");
    }
  }

  isTextBased() {
    return this.type === 'fill_blank';
  }

  isMultipleChoice() {
    return this.type === 'multiple';
  }
}

module.exports = Question;