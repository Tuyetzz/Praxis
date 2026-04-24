class TypingResultController {
  constructor({
    createTypingResult,
    getMyTypingResults,
    getTypingResultsByText,
    getTypingLeaderboard,
    getOneTypingResult
  }) {
    this.createTypingResult = createTypingResult;
    this.getMyTypingResults = getMyTypingResults;
    this.getTypingResultsByText = getTypingResultsByText;
    this.getTypingLeaderboard = getTypingLeaderboard;
    this.getOneTypingResult = getOneTypingResult;
  }

  async create(req, res) {
    try {
      const userId = req.user?.id;
      const result = await this.createTypingResult.execute({
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
      const result = await this.getMyTypingResults.execute(userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getByText(req, res) {
    try {
      const requestUserId = req.user?.id;
      const result = await this.getTypingResultsByText.execute({
        textId: req.params.textId,
        requestUserId
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getLeaderboard(req, res) {
    try {
      const requestUserId = req.user?.id;
      const result = await this.getTypingLeaderboard.execute({
        textId: req.params.textId,
        limit: req.query.limit,
        requestUserId
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const requestUserId = req.user?.id;
      const result = await this.getOneTypingResult.execute({
        resultId: req.params.id,
        requestUserId
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = TypingResultController;
