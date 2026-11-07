// src/domain/entities/Option.js
const BaseEntity = require("./BaseEntity");

class Option extends BaseEntity {
  constructor(data) {
    super(data);
    this.questionId = data.questionId;
    this.text = data.text;
    this.isCorrect = data.isCorrect || false;
    this.media = data.media || null;
    this.order = data.order || 0;
  }

  hasContent() {
    return !!this.text || !!this.media;
  }

  setCorrectness(status) {
    this.isCorrect = !!status;
  }
}

module.exports = Option;