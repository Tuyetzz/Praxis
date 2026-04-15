// src/usecases/chapter/GetChaptersBySubject.js
class GetChaptersBySubject {
  constructor({ chapterRepository, subjectRepository }) {
    this.chapterRepository = chapterRepository;
    this.subjectRepository = subjectRepository;
  }

  async execute(subjectId) {
    const subject = await this.subjectRepository.findById(subjectId);
    if (!subject) {
      throw new Error("Subject not found.");
    }

    return await this.chapterRepository.findBySubject(subjectId);
  }
}

module.exports = GetChaptersBySubject;
