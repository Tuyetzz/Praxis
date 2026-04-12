// src/usecases/chapter/GetOneChapter.js
const chapterRepository = require('../../infrastructure/repositories/ChapterRepository');

class GetOneChapter {
  async execute(id) {
    const chapter = await chapterRepository.findById(id);
    if (!chapter) {
      throw new Error("Chapter not found.");
    }
    return chapter;
  }
}

module.exports = new GetOneChapter();
