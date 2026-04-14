// src/usecases/option/GetOptionsByQuestion.js
const optionRepository = require('../../infrastructure/repositories/OptionRepository');
const questionRepository = require('../../infrastructure/repositories/QuestionRepository');

class GetOptionsByQuestion {
  async execute(questionId) {
    const question = await questionRepository.findById(questionId);
    if (!question) {
      throw new Error("Question not found.");
    }

    return await optionRepository.findByQuestion(questionId);
  }
}

module.exports = new GetOptionsByQuestion();
