const FlashcardDeck = require('../../domain/entities/FlashcardDeck');

class CreateFlashcardDeck {
  constructor({ flashcardDeckRepository, userRepository }) {
    this.flashcardDeckRepository = flashcardDeckRepository;
    this.userRepository = userRepository;
  }

  async execute(payload = {}) {
    const { userId, title, isPublic = false } = payload;

    if (!userId) {
      throw new Error('User is required.');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const deck = new FlashcardDeck({
      userId,
      title,
      isPublic: Boolean(isPublic)
    });

    return this.flashcardDeckRepository.create(deck, userId);
  }
}

module.exports = CreateFlashcardDeck;
