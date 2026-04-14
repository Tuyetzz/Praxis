// src/usecases/question/DeleteQuestion.js
const questionRepository = require('../../infrastructure/repositories/QuestionRepository');

class DeleteQuestion {
  async execute(id) {
    return await questionRepository.softDelete(id);
  }
}

module.exports = new DeleteQuestion();
