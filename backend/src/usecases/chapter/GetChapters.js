// src/usecases/chapter/GetChapters.js
class GetChapters {
  constructor({ chapterRepository }) {
    this.chapterRepository = chapterRepository;
  }

  async execute(filters = {}) {
    return await this.chapterRepository.findAll(filters);
  }
}

module.exports = GetChapters;
