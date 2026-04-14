// src/usecases/question/GetQuestions.js
const questionRepository = require('../../infrastructure/repositories/QuestionRepository');

class GetQuestions {
  async execute(filters = {}) {
    return await questionRepository.findAll(filters);
  }
}

module.exports = new GetQuestions();
