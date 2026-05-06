// src/usecases/chapter/GetChapterQuestionCount.js
class GetChapterQuestionCount {
  constructor({ chapterRepository }) {
    this.chapterRepository = chapterRepository;
  }

  async execute(chapterId) {
    if (!chapterId) {
      throw new Error("Chapter ID is required.");
    }

    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) {
      throw new Error("Chapter not found.");
    }

    const totalQuestions = await this.chapterRepository.countQuestionsByChapterId(chapterId);
    return { chapterId, totalQuestions };
  }
}

module.exports = GetChapterQuestionCount;
