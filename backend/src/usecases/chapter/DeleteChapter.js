// src/usecases/chapter/DeleteChapter.js
const chapterRepository = require('../../infrastructure/repositories/ChapterRepository');

class DeleteChapter {
  async execute(id) {
    const chapter = await chapterRepository.findById(id);
    if (!chapter) {
      throw new Error("Chapter not found.");
    }
    return await chapterRepository.softDelete(id);
  }
}

module.exports = new DeleteChapter();
