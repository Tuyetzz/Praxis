class DeleteFlashcardDeck {
  constructor({ flashcardDeckRepository }) {
    this.flashcardDeckRepository = flashcardDeckRepository;
  }

  async execute(payload = {}) {
    const { deckId, userId } = payload;

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
      throw new Error('Forbidden: You cannot delete this flashcard deck.');
    }

    return this.flashcardDeckRepository.softDelete(deckId);
  }
}

module.exports = DeleteFlashcardDeck;
