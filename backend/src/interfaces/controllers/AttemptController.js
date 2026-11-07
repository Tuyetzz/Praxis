// src/interfaces/controllers/AttemptController.js
class AttemptController {
  constructor({
    startAttempt,
    getAttempt,
    getAttemptQuestions,
    saveAnswer,
    submitAttempt,
    getAttemptGrade,
    hardDeleteAttempt,
    getMyAttempts,
    getAttempts
  }) {
    this.startAttemptUsecase = startAttempt;
    this.getAttemptUsecase = getAttempt;
    this.getAttemptQuestionsUsecase = getAttemptQuestions;
    this.saveAnswerUsecase = saveAnswer;
    this.submitAttemptUsecase = submitAttempt;
    this.getAttemptGradeUsecase = getAttemptGrade;
    this.hardDeleteAttemptUsecase = hardDeleteAttempt;
    this.getMyAttemptsUsecase = getMyAttempts;
    this.getAttemptsUsecase = getAttempts;
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

  async getMine(req, res) {
    try {
      const userId = req.user?.id;
      const result = await this.getMyAttemptsUsecase.execute(req.query, userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const roles = req.user?.roles || [];
      const result = await this.getAttemptsUsecase.execute(req.query, roles);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getQuestions(req, res) {
    try {
      const userId = req.user?.id;
      const { attemptId } = req.params;
      const result = await this.getAttemptQuestionsUsecase.execute({ attemptId, userId });
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
        ...req.body,
        userId,
        attemptId,
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

  async getGrade(req, res) {
    try {
      const userId = req.user?.id;
      const { attemptId } = req.params;
      const result = await this.getAttemptGradeUsecase.execute({
        attemptId,
        userId,
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async hardDelete(req, res) {
    try {
      const requestUserId = req.user?.id;
      const requestUserRoles = req.user?.roles || [];
      const result = await this.hardDeleteAttemptUsecase.execute({
        attemptId: req.params.id,
        requestUserId,
        requestUserRoles
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = AttemptController;
