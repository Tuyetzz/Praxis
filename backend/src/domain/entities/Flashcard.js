// src/domain/entities/Flashcard.js
const BaseEntity = require("./BaseEntity");

class Flashcard extends BaseEntity {
  constructor(data) {
    super(data);
    this.deckId = data.deckId;
    this.frontText = data.frontText;
    this.backText = data.backText;
    this.order = data.order || 0;
    this.nextReview = data.nextReview || null;

    this.validate();
  }

  validate() {
    if (!this.frontText || this.frontText.trim() === "") {
      throw new Error("Mặt trước của thẻ không được để trống.");
    }
    if (!this.backText || this.backText.trim() === "") {
      throw new Error("Mặt sau của thẻ không được để trống.");
    }
  }

  isDue() {
    if (!this.nextReview) return true; 
    return new Date() >= new Date(this.nextReview);
  }

  updateReviewSchedule(nextDate) {
    this.nextReview = nextDate;
  }
}

module.exports = Flashcard;