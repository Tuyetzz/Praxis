// src/usecases/question/GetQuestions.js
class GetQuestions {
  constructor({ questionRepository }) {
    this.questionRepository = questionRepository;
  }

  async execute(filters = {}) {
    const { includeDeleted, onlyDeleted, ...where } = filters || {};
    const includeDeletedFlag = includeDeleted === true || includeDeleted === 'true' || includeDeleted === '1';
    const onlyDeletedFlag = onlyDeleted === true || onlyDeleted === 'true' || onlyDeleted === '1';

    return await this.questionRepository.findAll(where, {
      includeDeleted: includeDeletedFlag,
      onlyDeleted: onlyDeletedFlag
    });
  }
}

module.exports = GetQuestions;
