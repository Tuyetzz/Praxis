const TypingText = require('../../domain/entities/TypingText');
const { toBoolean } = require('../../infrastructure/utils/typeConverters');

class CreateTypingText {
  constructor({ typingTextRepository, userRepository }) {
    this.typingTextRepository = typingTextRepository;
    this.userRepository = userRepository;
  }

  async execute(payload = {}) {
    const {
      authorId,
      title,
      content,
      language,
      isPublic = false,
      isDefault = false,
      difficulty,
      sourceType
    } = payload;

    if (!authorId) {
      throw new Error('Author is required.');
    }

    const author = await this.userRepository.findById(authorId);
    if (!author) {
      throw new Error('Author not found.');
    }

    const typingText = new TypingText({
      authorId,
      title,
      content,
      language,
      isPublic: toBoolean(isPublic),
      isDefault: toBoolean(isDefault),
      difficulty,
      sourceType
    });

    return this.typingTextRepository.create(typingText, authorId);
  }
}

module.exports = CreateTypingText;
