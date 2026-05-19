// src/usecases/question/RestoreQuestion.js
class RestoreQuestion {
  constructor({ questionRepository }) {
    this.questionRepository = questionRepository;
  }

  async execute(id) {
    if (!id) {
      throw new Error("Question ID is required.");
    }

    const question = await this.questionRepository.findByIdIncludingDeleted(id);
    if (!question) {
      throw new Error("Question not found.");
    }

    return await this.questionRepository.restore(id);
  }
}

module.exports = RestoreQuestion;
