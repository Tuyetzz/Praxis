// src/domain/entities/FlashcardDeck.js
const BaseEntity = require("./BaseEntity");

class FlashcardDeck extends BaseEntity {
  constructor(data) {
    super(data);
    this.userId = data.userId;
    this.title = data.title;
    this.isPublic = data.isPublic || false;

    this.validate();
  }

  validate() {
    if (!this.title || this.title.trim().length < 3) {
      throw new Error("Tiêu đề bộ thẻ phải có ít nhất 3 ký tự.");
    }
    if (!this.userId) {
      throw new Error("Bộ thẻ phải thuộc về một người dùng nhất định.");
    }
  }

  canBeViewedBy(requestUserId) {
    return this.isPublic || this.userId === requestUserId;
  }

  togglePublic() {
    this.isPublic = !this.isPublic;
  }
}

module.exports = FlashcardDeck;