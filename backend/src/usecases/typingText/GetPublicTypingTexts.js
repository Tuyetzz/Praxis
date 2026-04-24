class GetPublicTypingTexts {
  constructor({ typingTextRepository }) {
    this.typingTextRepository = typingTextRepository;
  }

  async execute() {
    return this.typingTextRepository.findPublicTexts();
  }
}

module.exports = GetPublicTypingTexts;
