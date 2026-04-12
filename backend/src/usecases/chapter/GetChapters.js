// src/usecases/chapter/GetChapters.js
const chapterRepository = require('../../infrastructure/repositories/ChapterRepository');

class GetChapters {
  async execute(filters = {}) {
    return await chapterRepository.findAll(filters);
  }
}

module.exports = new GetChapters();
