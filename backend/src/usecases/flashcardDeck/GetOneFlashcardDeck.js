class GetOneFlashcardDeck {
  constructor({ flashcardDeckRepository }) {
    this.flashcardDeckRepository = flashcardDeckRepository;
  }

  async execute(payload = {}) {
    const { deckId, requestUserId } = payload;

    if (!deckId) {
      throw new Error('Deck ID is required.');
    }

    const deck = await this.flashcardDeckRepository.findById(deckId);
    if (!deck) {
      throw new Error('Flashcard deck not found.');
    }

    if (!deck.canBeViewedBy(requestUserId)) {
      throw new Error('Forbidden: You cannot view this flashcard deck.');
    }

    return deck;
  }
}

module.exports = GetOneFlashcardDeck;
