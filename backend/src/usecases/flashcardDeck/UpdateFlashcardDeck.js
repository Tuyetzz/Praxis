const FlashcardDeck = require('../../domain/entities/FlashcardDeck');

class UpdateFlashcardDeck {
  constructor({ flashcardDeckRepository }) {
    this.flashcardDeckRepository = flashcardDeckRepository;
  }

  async execute(payload = {}) {
    const { deckId, userId, updateData = {} } = payload;

    if (!deckId) {
      throw new Error('Deck ID is required.');
    }
    if (!userId) {
      throw new Error('User is required.');
    }

    const deck = await this.flashcardDeckRepository.findById(deckId);
    if (!deck) {
      throw new Error('Flashcard deck not found.');
    }

    if (deck.userId !== userId) {
      throw new Error('Forbidden: You cannot update this flashcard deck.');
    }

    const title = Object.prototype.hasOwnProperty.call(updateData, 'title')
      ? updateData.title
      : deck.title;
    const isPublic = Object.prototype.hasOwnProperty.call(updateData, 'isPublic')
      ? Boolean(updateData.isPublic)
      : deck.isPublic;

    new FlashcardDeck({
      userId: deck.userId,
      title,
      isPublic
    });

    return this.flashcardDeckRepository.update(
      deckId,
      {
        ...(Object.prototype.hasOwnProperty.call(updateData, 'title') ? { title } : {}),
        ...(Object.prototype.hasOwnProperty.call(updateData, 'isPublic') ? { isPublic } : {})
      },
      userId
    );
  }
}

module.exports = UpdateFlashcardDeck;
