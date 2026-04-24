const TypingResult = require('../../domain/entities/TypingResult');

class CreateTypingResult {
  constructor({ typingResultRepository, typingTextRepository, userRepository }) {
    this.typingResultRepository = typingResultRepository;
    this.typingTextRepository = typingTextRepository;
    this.userRepository = userRepository;
  }

  async execute(payload = {}) {
    const { userId, textId, wpm, accuracy, rawWpm, durationSeconds, errorTags } = payload;

    if (!userId) {
      throw new Error('User is required.');
    }

    if (!textId) {
      throw new Error('Typing text ID is required.');
    }

    if (!Number.isFinite(wpm) || wpm < 0) {
      throw new Error('WPM must be a non-negative number.');
    }

    if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
      throw new Error('Accuracy must be between 0 and 100.');
    }

    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new Error('Duration must be a positive number of seconds.');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const text = await this.typingTextRepository.findById(textId);
    if (!text) {
      throw new Error('Typing text not found.');
    }

    if (!text.isPublic && text.authorId !== userId) {
      throw new Error('Forbidden: You cannot submit result for this text.');
    }

    const hasRawWpm = Object.prototype.hasOwnProperty.call(payload, 'rawWpm');
    if (hasRawWpm) {
      if (!Number.isFinite(rawWpm) || rawWpm < 0) {
        throw new Error('Raw WPM must be a non-negative number.');
      }
    }

    const typingResult = new TypingResult({
      userId,
      textId,
      wpm: Number(wpm),
      accuracy: Number(accuracy),
      rawWpm: hasRawWpm ? Number(rawWpm) : Number(wpm),
      durationSeconds: Math.round(durationSeconds),
      errorTags: errorTags || {}
    });

    const saved = await this.typingResultRepository.create(typingResult, userId);

    return {
      ...saved,
      performanceLevel: typingResult.getPerformanceLevel()
    };
  }
}

module.exports = CreateTypingResult;
