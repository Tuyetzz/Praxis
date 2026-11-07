// src/usecases/question/GetOneQuestion.js
class GetOneQuestion {
  constructor({ questionRepository }) {
    this.questionRepository = questionRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Question id is required');
    const question = await this.questionRepository.findById(id);
    if (!question) throw new Error('Could not find question with the provided id');
    return question;
  }
}

module.exports = GetOneQuestion;
