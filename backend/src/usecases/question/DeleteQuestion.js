// src/usecases/question/DeleteQuestion.js
class DeleteQuestion {
  constructor({ questionRepository }) {
    this.questionRepository = questionRepository;
  }

  async execute(id) {
    if (!id) throw new Error("Question ID is required for deletion.");
    const question = await this.questionRepository.findById(id);
    if (!question) throw new Error("Could not find question with the provided id.");
    
    return await this.questionRepository.softDelete(id);
  }
}

module.exports = DeleteQuestion;
