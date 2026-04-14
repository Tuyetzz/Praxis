// src/usecases/question/GetQuestionsBySubject.js
const questionRepository = require('../../infrastructure/repositories/QuestionRepository');
const subjectRepository = require('../../infrastructure/repositories/SubjectRepository');

class GetQuestionsBySubject {
  async execute(subjectId) {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new Error("Subject not found.");
    }

    return await questionRepository.findBySubject(subjectId);
  }
}

module.exports = new GetQuestionsBySubject();
