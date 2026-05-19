// src/usecases/option/GetOptionsByQuestion.js
class GetOptionsByQuestion {
  constructor({ optionRepository, questionRepository }) {
    this.optionRepository = optionRepository;
    this.questionRepository = questionRepository;
  }

  async execute(questionId, params = {}) {
    const { includeDeleted, onlyDeleted } = params;
    const includeDeletedFlag = includeDeleted === true || includeDeleted === 'true' || includeDeleted === '1';
    const onlyDeletedFlag = onlyDeleted === true || onlyDeleted === 'true' || onlyDeleted === '1';

    const question = await this.questionRepository.findById(questionId, {
      includeDeleted: includeDeletedFlag || onlyDeletedFlag
    });
    if (!question) {
      throw new Error("Question not found.");
    }

    return await this.optionRepository.findByQuestion(questionId, {
      includeDeleted: includeDeletedFlag,
      onlyDeleted: onlyDeletedFlag
    });
  }
}

module.exports = GetOptionsByQuestion;
