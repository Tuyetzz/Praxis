// src/usecases/chapter/GetChaptersBySubject.js
const chapterRepository = require('../../infrastructure/repositories/ChapterRepository');
const subjectRepository = require('../../infrastructure/repositories/SubjectRepository');

class GetChaptersBySubject {
  async execute(subjectId) {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new Error("Subject not found.");
    }

    return await chapterRepository.findBySubject(subjectId);
  }
}

module.exports = new GetChaptersBySubject();
