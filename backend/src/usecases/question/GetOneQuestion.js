// src/usecases/question/GetOneQuestion.js
const questionRepository = require('../../infrastructure/repositories/QuestionRepository');

class GetOneQuestion {
  async execute(id) {
    if (!id) throw new Error('Question id is required');
    const question = await questionRepository.findById(id);
    if (!question) throw new Error('Could not find question with the provided id');
    return question;
  }
}

module.exports = new GetOneQuestion();
