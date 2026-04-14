// src/usecases/question/GetOneQuestion.js
const questionRepository = require('../../infrastructure/repositories/QuestionRepository');

class GetOneQuestion {
  async execute(id) {
    if (!id) throw new Error('Question id is required');
    return await questionRepository.findById(id);
  }
}

module.exports = new GetOneQuestion();
