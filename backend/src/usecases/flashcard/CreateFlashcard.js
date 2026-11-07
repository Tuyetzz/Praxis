const Flashcard = require('../../domain/entities/Flashcard');

class CreateFlashcard {
  constructor({ flashcardRepository, flashcardDeckRepository }) {
    this.flashcardRepository = flashcardRepository;
    this.flashcardDeckRepository = flashcardDeckRepository;
  }

  async execute(payload = {}) {
    const { userId, deckId, frontText, backText, order = 0, nextReview = null } = payload;

    if (!userId) {
      throw new Error('User is required.');
    }
    if (!deckId) {
      throw new Error('Deck ID is required.');
    }

    const deck = await this.flashcardDeckRepository.findById(deckId);
    if (!deck) {
      throw new Error('Flashcard deck not found.');
    }

    if (deck.userId !== userId) {
      throw new Error('Forbidden: You cannot add cards to this deck.');
    }

    const flashcard = new Flashcard({
      deckId,
      frontText,
      backText,
      order,
      nextReview
    });

    return this.flashcardRepository.create(flashcard, userId);
  }
}

module.exports = CreateFlashcard;
