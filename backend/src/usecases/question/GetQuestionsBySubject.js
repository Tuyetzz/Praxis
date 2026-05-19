// src/usecases/question/GetQuestionsBySubject.js
class GetQuestionsBySubject {
  constructor({ questionRepository, subjectRepository }) {
    this.questionRepository = questionRepository;
    this.subjectRepository = subjectRepository;
  }

  async execute(subjectId, params = {}) {
    const { includeDeleted, onlyDeleted } = params;
    const includeDeletedFlag = includeDeleted === true || includeDeleted === 'true' || includeDeleted === '1';
    const onlyDeletedFlag = onlyDeleted === true || onlyDeleted === 'true' || onlyDeleted === '1';

    const subject = await this.subjectRepository.findById(subjectId, {
      includeDeleted: includeDeletedFlag || onlyDeletedFlag
    });
    if (!subject) {
      throw new Error("Subject not found.");
    }

    return await this.questionRepository.findBySubject(subjectId, {
      includeDeleted: includeDeletedFlag,
      onlyDeleted: onlyDeletedFlag
    });
  }
}

module.exports = GetQuestionsBySubject;
