class GetMyTypingResults {
  constructor({ typingResultRepository }) {
    this.typingResultRepository = typingResultRepository;
  }

  async execute(userId) {
    if (!userId) {
      throw new Error('User is required.');
    }

    return this.typingResultRepository.findByUser(userId);
  }
}

module.exports = GetMyTypingResults;
