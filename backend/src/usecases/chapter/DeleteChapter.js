// src/usecases/chapter/DeleteChapter.js
class DeleteChapter {
  constructor({ chapterRepository }) {
    this.chapterRepository = chapterRepository;
  }

  async execute(id) {
    const chapter = await this.chapterRepository.findById(id);
    if (!chapter) {
      throw new Error("Chapter not found.");
    }
    return await this.chapterRepository.softDelete(id);
  }
}

module.exports = DeleteChapter;
