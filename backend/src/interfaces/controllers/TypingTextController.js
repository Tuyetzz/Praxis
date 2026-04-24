class TypingTextController {
  constructor({
    createTypingText,
    getTypingTexts,
    getPublicTypingTexts,
    getMyTypingTexts,
    getOneTypingText,
    updateTypingText,
    deleteTypingText
  }) {
    this.createTypingText = createTypingText;
    this.getTypingTexts = getTypingTexts;
    this.getPublicTypingTexts = getPublicTypingTexts;
    this.getMyTypingTexts = getMyTypingTexts;
    this.getOneTypingText = getOneTypingText;
    this.updateTypingText = updateTypingText;
    this.deleteTypingText = deleteTypingText;
  }

  async create(req, res) {
    try {
      const authorId = req.user?.id;
      const result = await this.createTypingText.execute({
        ...req.body,
        authorId
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await this.getTypingTexts.execute(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getPublic(req, res) {
    try {
      const result = await this.getPublicTypingTexts.execute();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getMine(req, res) {
    try {
      const authorId = req.user?.id;
      const result = await this.getMyTypingTexts.execute(authorId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const requestUserId = req.user?.id;
      const result = await this.getOneTypingText.execute({
        textId: req.params.id,
        requestUserId
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const authorId = req.user?.id;
      const result = await this.updateTypingText.execute({
        textId: req.params.id,
        authorId,
        updateData: req.body
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const authorId = req.user?.id;
      await this.deleteTypingText.execute({
        textId: req.params.id,
        authorId
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = TypingTextController;
