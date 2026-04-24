class GetTypingTexts {
  constructor({ typingTextRepository }) {
    this.typingTextRepository = typingTextRepository;
  }

  async execute(filters = {}) {
    return this.typingTextRepository.findAll(filters);
  }
}

module.exports = GetTypingTexts;
