// src/usecases/option/GetOptionsByQuestion.js
class GetOptionsByQuestion {
  constructor({ optionRepository, questionRepository }) {
    this.optionRepository = optionRepository;
    this.questionRepository = questionRepository;
  }

  async execute(questionId) {
    const question = await this.questionRepository.findById(questionId);
    if (!question) {
      throw new Error("Question not found.");
    }

    return await this.optionRepository.findByQuestion(questionId);
  }
}

module.exports = GetOptionsByQuestion;
