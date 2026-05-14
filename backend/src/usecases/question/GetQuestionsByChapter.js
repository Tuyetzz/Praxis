// src/usecases/question/GetQuestionsByChapter.js
class GetQuestionsByChapter {
  constructor({ questionRepository, chapterRepository }) {
    this.questionRepository = questionRepository;
    this.chapterRepository = chapterRepository;
  }

  async execute(chapterId, params = {}) {
    const { includeDeleted, onlyDeleted } = params;
    const includeDeletedFlag = includeDeleted === true || includeDeleted === 'true' || includeDeleted === '1';
    const onlyDeletedFlag = onlyDeleted === true || onlyDeleted === 'true' || onlyDeleted === '1';

    const chapter = await this.chapterRepository.findById(chapterId, {
      includeDeleted: includeDeletedFlag || onlyDeletedFlag
    });
    if (!chapter) {
      throw new Error("Chapter not found.");
    }

    return await this.questionRepository.findByChapter(chapterId, {
      includeDeleted: includeDeletedFlag,
      onlyDeleted: onlyDeletedFlag
    });
  }
}

module.exports = GetQuestionsByChapter;
