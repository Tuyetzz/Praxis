// src/usecases/question/DeleteQuestion.js
const questionRepository = require('../../infrastructure/repositories/QuestionRepository');

class DeleteQuestion {
  async execute(id) {
    if (!id) throw new Error("Question ID is required for deletion.");
    const question = await questionRepository.findById(id);
    if (!question) throw new Error("Could not find question with the provided id.");
    
    return await questionRepository.softDelete(id);
  }
}

module.exports = new DeleteQuestion();
