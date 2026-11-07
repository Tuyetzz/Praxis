class GetMyTypingTexts {
  constructor({ typingTextRepository }) {
    this.typingTextRepository = typingTextRepository;
  }

  async execute(authorId) {
    if (!authorId) {
      throw new Error('Author is required.');
    }

    return this.typingTextRepository.findByAuthor(authorId);
  }
}

module.exports = GetMyTypingTexts;
