class GetPublicFlashcardDecks {
  constructor({ flashcardDeckRepository }) {
    this.flashcardDeckRepository = flashcardDeckRepository;
  }

  async execute() {
    return this.flashcardDeckRepository.findPublicDecks();
  }
}

module.exports = GetPublicFlashcardDecks;
