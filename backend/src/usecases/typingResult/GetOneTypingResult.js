class GetOneTypingResult {
  constructor({ typingResultRepository }) {
    this.typingResultRepository = typingResultRepository;
  }

  async execute(payload = {}) {
    const { resultId, requestUserId } = payload;

    if (!resultId) {
      throw new Error('Typing result ID is required.');
    }

    const result = await this.typingResultRepository.findById(resultId);
    if (!result) {
      throw new Error('Typing result not found.');
    }

    if (result.userId !== requestUserId) {
      throw new Error('Forbidden: You cannot view this typing result.');
    }

    return result;
  }
}

module.exports = GetOneTypingResult;
