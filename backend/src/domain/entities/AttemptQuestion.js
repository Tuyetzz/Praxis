// src/domain/entities/AttemptQuestion.js
const BaseEntity = require("./BaseEntity");

class AttemptQuestion extends BaseEntity {
  constructor(data) {
    super(data); 
    this.attemptId = data.attemptId;
    this.questionId = data.questionId;
    this.optionOrder = data.optionOrder || [];
    this.pageIndex = data.pageIndex || 0;
    this.sequence = data.sequence ?? 0;
  }

  isAtPage(index) {
    return this.pageIndex === index;
  }
}

module.exports = AttemptQuestion;