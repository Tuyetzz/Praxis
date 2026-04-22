class FlashcardDeckController {
  constructor({
    createFlashcardDeck,
    getMyFlashcardDecks,
    getPublicFlashcardDecks,
    getOneFlashcardDeck,
    updateFlashcardDeck,
    deleteFlashcardDeck
  }) {
    this.createFlashcardDeck = createFlashcardDeck;
    this.getMyFlashcardDecks = getMyFlashcardDecks;
    this.getPublicFlashcardDecks = getPublicFlashcardDecks;
    this.getOneFlashcardDeck = getOneFlashcardDeck;
    this.updateFlashcardDeck = updateFlashcardDeck;
    this.deleteFlashcardDeck = deleteFlashcardDeck;
  }

  async create(req, res) {
    try {
      const userId = req.user?.id;
      const result = await this.createFlashcardDeck.execute({
        ...req.body,
        userId
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getMine(req, res) {
    try {
      const userId = req.user?.id;
      const result = await this.getMyFlashcardDecks.execute(userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getPublic(req, res) {
    try {
      const result = await this.getPublicFlashcardDecks.execute();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const userId = req.user?.id;
      const result = await this.getOneFlashcardDeck.execute({
        deckId: req.params.id,
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
      const result = await this.updateFlashcardDeck.execute({
        deckId: req.params.id,
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
      await this.deleteFlashcardDeck.execute({
        deckId: req.params.id,
        userId
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = FlashcardDeckController;
