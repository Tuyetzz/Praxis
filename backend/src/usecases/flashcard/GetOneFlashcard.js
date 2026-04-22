class GetOneFlashcard {
  constructor({ flashcardRepository, flashcardDeckRepository }) {
    this.flashcardRepository = flashcardRepository;
    this.flashcardDeckRepository = flashcardDeckRepository;
  }

  async execute(payload = {}) {
    const { flashcardId, requestUserId } = payload;

    if (!flashcardId) {
      throw new Error('Flashcard ID is required.');
    }

    const flashcard = await this.flashcardRepository.findById(flashcardId);
    if (!flashcard) {
      throw new Error('Flashcard not found.');
    }

    const deck = await this.flashcardDeckRepository.findById(flashcard.deckId);
    if (!deck) {
      throw new Error('Flashcard deck not found.');
    }

    if (!deck.canBeViewedBy(requestUserId)) {
      throw new Error('Forbidden: You cannot view this flashcard.');
    }

    return flashcard;
  }
}

module.exports = GetOneFlashcard;
