// src/usecases/typingText/RestoreTypingText.js
class RestoreTypingText {
  constructor({ typingTextRepository }) {
    this.typingTextRepository = typingTextRepository;
  }

  async execute(textId) {
    if (!textId) {
      throw new Error('Typing text ID is required.');
    }

    const text = await this.typingTextRepository.findByIdIncludingDeleted(textId);
    if (!text) {
      throw new Error('Typing text not found.');
    }

    return this.typingTextRepository.restore(textId);
  }
}

module.exports = RestoreTypingText;
