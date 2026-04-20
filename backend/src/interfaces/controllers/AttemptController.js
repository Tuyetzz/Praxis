// src/interfaces/controllers/AttemptController.js
class AttemptController {
  constructor({ startAttempt, getAttempt, saveAnswer, submitAttempt }) {
    this.startAttemptUsecase = startAttempt;
    this.getAttemptUsecase = getAttempt;
    this.saveAnswerUsecase = saveAnswer;
    this.submitAttemptUsecase = submitAttempt;
  }

  async start(req, res) {
    try {
      const userId = req.user?.id;
      const result = await this.startAttemptUsecase.execute({
        ...req.body,
        userId,
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const result = await this.getAttemptUsecase.execute(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async saveAnswer(req, res) {
    try {
      const userId = req.user?.id;
      const { attemptId } = req.params;
      const result = await this.saveAnswerUsecase.execute({
        userId,
        attemptId,
        ...req.body,
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async submitAttempt(req, res) {
    try {
      const userId = req.user?.id;
      const { attemptId } = req.params;
      const result = await this.submitAttemptUsecase.execute({
        userId,
        attemptId,
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = AttemptController;
