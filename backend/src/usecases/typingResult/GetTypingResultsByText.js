class GetTypingResultsByText {
  constructor({ typingResultRepository, typingTextRepository }) {
    this.typingResultRepository = typingResultRepository;
    this.typingTextRepository = typingTextRepository;
  }

  async execute(payload = {}) {
    const { textId, requestUserId } = payload;

    if (!textId) {
      throw new Error('Typing text ID is required.');
    }

    const text = await this.typingTextRepository.findById(textId);
    if (!text) {
      throw new Error('Typing text not found.');
    }

    if (!text.isPublic && text.authorId !== requestUserId) {
      throw new Error('Forbidden: You cannot view results of this text.');
    }

    return this.typingResultRepository.findByText(textId);
  }
}

module.exports = GetTypingResultsByText;
