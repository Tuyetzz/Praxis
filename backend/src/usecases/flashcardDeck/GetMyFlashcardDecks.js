class GetMyFlashcardDecks {
  constructor({ flashcardDeckRepository }) {
    this.flashcardDeckRepository = flashcardDeckRepository;
  }

  async execute(userId) {
    if (!userId) {
      throw new Error('User is required.');
    }

    return this.flashcardDeckRepository.findByUser(userId);
  }
}

module.exports = GetMyFlashcardDecks;
