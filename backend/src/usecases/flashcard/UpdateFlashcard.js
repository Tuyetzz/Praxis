const Flashcard = require('../../domain/entities/Flashcard');

class UpdateFlashcard {
  constructor({ flashcardRepository, flashcardDeckRepository }) {
    this.flashcardRepository = flashcardRepository;
    this.flashcardDeckRepository = flashcardDeckRepository;
  }

  async execute(payload = {}) {
    const { flashcardId, userId, updateData = {} } = payload;

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
      throw new Error('Forbidden: You cannot update this flashcard.');
    }

    const finalData = {
      deckId: flashcard.deckId,
      frontText: Object.prototype.hasOwnProperty.call(updateData, 'frontText') ? updateData.frontText : flashcard.frontText,
      backText: Object.prototype.hasOwnProperty.call(updateData, 'backText') ? updateData.backText : flashcard.backText,
      order: Object.prototype.hasOwnProperty.call(updateData, 'order') ? updateData.order : flashcard.order,
      nextReview: Object.prototype.hasOwnProperty.call(updateData, 'nextReview') ? updateData.nextReview : flashcard.nextReview
    };

    new Flashcard(finalData);

    return this.flashcardRepository.update(
      flashcardId,
      {
        ...(Object.prototype.hasOwnProperty.call(updateData, 'frontText') ? { frontText: finalData.frontText } : {}),
        ...(Object.prototype.hasOwnProperty.call(updateData, 'backText') ? { backText: finalData.backText } : {}),
        ...(Object.prototype.hasOwnProperty.call(updateData, 'order') ? { order: finalData.order } : {}),
        ...(Object.prototype.hasOwnProperty.call(updateData, 'nextReview') ? { nextReview: finalData.nextReview } : {})
      },
      userId
    );
  }
}

module.exports = UpdateFlashcard;
