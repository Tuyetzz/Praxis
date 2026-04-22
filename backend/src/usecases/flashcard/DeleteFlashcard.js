class DeleteFlashcard {
  constructor({ flashcardRepository, flashcardDeckRepository }) {
    this.flashcardRepository = flashcardRepository;
    this.flashcardDeckRepository = flashcardDeckRepository;
  }

  async execute(payload = {}) {
    const { flashcardId, userId } = payload;

    if (!flashcardId) {
      throw new Error('Flashcard ID is required.');
    }
    if (!userId) {
      throw new Error('User is required.');
    }

    const flashcard = await this.flashcardRepository.findById(flashcardId);
    if (!flashcard) {
      throw new Error('Flashcard not found.');
    }

    const deck = await this.flashcardDeckRepository.findById(flashcard.deckId);
    if (!deck) {
      throw new Error('Flashcard deck not found.');
    }

    if (deck.userId !== userId) {
      throw new Error('Forbidden: You cannot delete this flashcard.');
    }

    return this.flashcardRepository.softDelete(flashcardId);
  }
}

module.exports = DeleteFlashcard;
