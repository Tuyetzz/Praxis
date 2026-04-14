// src/usecases/question/GetQuestionsByChapter.js
const questionRepository = require('../../infrastructure/repositories/QuestionRepository');
const chapterRepository = require('../../infrastructure/repositories/ChapterRepository');

class GetQuestionsByChapter {
  async execute(chapterId) {
    const chapter = await chapterRepository.findById(chapterId);
    if (!chapter) {
      throw new Error("Chapter not found.");
    }

    return await questionRepository.findByChapter(chapterId);
  }
}

module.exports = new GetQuestionsByChapter();
