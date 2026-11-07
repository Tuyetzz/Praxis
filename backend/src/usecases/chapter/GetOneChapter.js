// src/usecases/chapter/GetOneChapter.js
class GetOneChapter {
  constructor({ chapterRepository }) {
    this.chapterRepository = chapterRepository;
  }

  async execute(id) {
    const chapter = await this.chapterRepository.findById(id);
    if (!chapter) {
      throw new Error("Chapter not found.");
    }
    return chapter;
  }
}

module.exports = GetOneChapter;
