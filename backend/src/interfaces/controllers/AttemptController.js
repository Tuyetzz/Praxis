// src/interfaces/controllers/AttemptController.js
class AttemptController {
  constructor({ startAttempt, getAttempt }) {
    this.startAttempt = startAttempt;
    this.getAttempt = getAttempt;
  }

  async start(req, res) {
    try {
      const userId = req.user?.id;
      const result = await this.startAttempt.execute({
        userId,
        ...req.body,
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const result = await this.getAttempt.execute(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = AttemptController;
