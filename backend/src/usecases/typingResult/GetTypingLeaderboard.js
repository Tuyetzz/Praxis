class GetTypingLeaderboard {
  constructor({ typingResultRepository, typingTextRepository }) {
    this.typingResultRepository = typingResultRepository;
    this.typingTextRepository = typingTextRepository;
  }

  async execute(payload = {}) {
    const { textId, limit = 10, requestUserId } = payload;

    if (!textId) {
      throw new Error('Typing text ID is required.');
    }

    const text = await this.typingTextRepository.findById(textId);
    if (!text) {
      throw new Error('Typing text not found.');
    }

    if (!text.isPublic && text.authorId !== requestUserId) {
      throw new Error('Forbidden: You cannot view leaderboard of this text.');
    }

    const parsedLimit = Number(limit);
    const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(100, Math.floor(parsedLimit))
      : 10;

    return this.typingResultRepository.findLeaderboardByText(textId, safeLimit);
  }
}

module.exports = GetTypingLeaderboard;
