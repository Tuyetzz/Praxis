// src/usecases/question/GetQuestions.js
class GetQuestions {
  constructor({ questionRepository }) {
    this.questionRepository = questionRepository;
  }

  async execute(filters = {}) {
    return await this.questionRepository.findAll(filters);
  }
}

module.exports = GetQuestions;
