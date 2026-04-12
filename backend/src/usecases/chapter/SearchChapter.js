// src/usecases/chapter/SearchChapter.js
const chapterRepository = require('../../infrastructure/repositories/ChapterRepository');

class SearchChapter {
  async execute(params = {}) {
    const {
      page = 1,
      limit = 10,
      search = null,
      subjectId = null,
      order = 'order'
    } = params;

    // Validate pagination params
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Map order param to Sequelize format
    let orderBy = [["order", "ASC"]];
    if (order === 'name') {
      orderBy = [["name", "ASC"]];
    } else if (order === 'newest') {
      orderBy = [["createdAt", "DESC"]];
    } else if (order === 'oldest') {
      orderBy = [["createdAt", "ASC"]];
    }

    // Build where clause
    const where = {};
    if (subjectId) {
      where.subjectId = subjectId;
    }

    return await chapterRepository.findWithPagination({
      limit: limitNum,
      offset,
      search,
      searchFields: ['name'],
      order: orderBy,
      where
    });
  }
}

module.exports = new SearchChapter();
