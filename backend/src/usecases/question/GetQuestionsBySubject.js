// src/usecases/question/GetQuestionsBySubject.js
class GetQuestionsBySubject {
  constructor({ questionRepository, subjectRepository }) {
    this.questionRepository = questionRepository;
    this.subjectRepository = subjectRepository;
  }

  async execute(subjectId) {
    const subject = await this.subjectRepository.findById(subjectId);
    if (!subject) {
      throw new Error("Subject not found.");
    }

    return await this.questionRepository.findBySubject(subjectId);
  }
}

module.exports = GetQuestionsBySubject;
