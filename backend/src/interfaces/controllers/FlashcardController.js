class FlashcardController {
  constructor({
    createFlashcard,
    getFlashcardsByDeck,
    getOneFlashcard,
    updateFlashcard,
    deleteFlashcard
  }) {
    this.createFlashcard = createFlashcard;
    this.getFlashcardsByDeck = getFlashcardsByDeck;
    this.getOneFlashcard = getOneFlashcard;
    this.updateFlashcard = updateFlashcard;
    this.deleteFlashcard = deleteFlashcard;
  }

  async create(req, res) {
    try {
      const userId = req.user?.id;
      const result = await this.createFlashcard.execute({
        ...req.body,
        userId
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getByDeck(req, res) {
    try {
      const userId = req.user?.id;
      const result = await this.getFlashcardsByDeck.execute({
        deckId: req.params.deckId,
        requestUserId: userId
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const userId = req.user?.id;
      const result = await this.getOneFlashcard.execute({
        flashcardId: req.params.id,
        requestUserId: userId
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const userId = req.user?.id;
      const result = await this.updateFlashcard.execute({
        flashcardId: req.params.id,
        userId,
        updateData: req.body
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const userId = req.user?.id;
      await this.deleteFlashcard.execute({
        flashcardId: req.params.id,
        userId
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = FlashcardController;
