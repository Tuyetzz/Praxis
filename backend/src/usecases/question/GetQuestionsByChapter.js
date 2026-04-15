// src/usecases/question/GetQuestionsByChapter.js
class GetQuestionsByChapter {
  constructor({ questionRepository, chapterRepository }) {
    this.questionRepository = questionRepository;
    this.chapterRepository = chapterRepository;
  }

  async execute(chapterId) {
    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) {
      throw new Error("Chapter not found.");
    }

    return await this.questionRepository.findByChapter(chapterId);
  }
}

module.exports = GetQuestionsByChapter;
