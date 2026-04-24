class DeleteTypingText {
  constructor({ typingTextRepository }) {
    this.typingTextRepository = typingTextRepository;
  }

  async execute(payload = {}) {
    const { textId, authorId } = payload;

    if (!textId) {
      throw new Error('Typing text ID is required.');
    }
    if (!authorId) {
      throw new Error('Author is required.');
    }

    const text = await this.typingTextRepository.findById(textId);
    if (!text) {
      throw new Error('Typing text not found.');
    }

    if (text.authorId !== authorId) {
      throw new Error('Forbidden: You cannot delete this typing text.');
    }

    return this.typingTextRepository.softDelete(textId);
  }
}

module.exports = DeleteTypingText;
