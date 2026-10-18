// src/interfaces/controllers/AIController.js
class AIController {
  constructor({ generateQuiz }) {
    this.generateQuiz = generateQuiz;
  }

  async generateQuizQuestions(req, res) {
    try {
      const result = await this.generateQuiz.execute(req.body || {});
      return res.status(200).json(result);
    } catch (error) {
      if (error.code === "AI_NOT_CONFIGURED") {
        return res.status(503).json({ message: error.message });
      }
      if (error.code === "AI_TIMEOUT") {
        return res.status(504).json({ message: error.message });
      }
      if (error.code === "AI_PROVIDER_ERROR") {
        // Surface the provider's own status (401/429/etc.) so Postman shows the cause.
        return res.status(error.status || 502).json({ message: error.message });
      }
      if (error.code === "AI_TRUNCATED") {
        return res.status(502).json({ message: error.message });
      }
      if (error.code === "PROMPT_INJECTION_DETECTED") {
        return res.status(400).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = AIController;
