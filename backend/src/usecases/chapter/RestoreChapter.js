// src/usecases/chapter/RestoreChapter.js
class RestoreChapter {
  constructor({ chapterRepository }) {
    this.chapterRepository = chapterRepository;
  }

  async execute(id) {
    if (!id) {
      throw new Error("Chapter ID is required.");
    }

    const chapter = await this.chapterRepository.findByIdIncludingDeleted(id);
    if (!chapter) {
      throw new Error("Chapter not found.");
    }

    return await this.chapterRepository.restore(id);
  }
}

module.exports = RestoreChapter;
