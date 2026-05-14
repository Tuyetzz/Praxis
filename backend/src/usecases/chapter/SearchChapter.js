// src/usecases/chapter/SearchChapter.js
class SearchChapter {
  constructor({ chapterRepository }) {
    this.chapterRepository = chapterRepository;
  }

  async execute(params = {}) {
    const {
      page = 1,
      limit = 10,
      search = null,
      subjectId = null,
      order = 'order',
      includeDeleted,
      onlyDeleted
    } = params;
    const includeDeletedFlag = includeDeleted === true || includeDeleted === 'true' || includeDeleted === '1';
    const onlyDeletedFlag = onlyDeleted === true || onlyDeleted === 'true' || onlyDeleted === '1';

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

    return await this.chapterRepository.findWithPagination({
      limit: limitNum,
      offset,
      search,
      searchFields: ['name'],
      order: orderBy,
      where,
      includeDeleted: includeDeletedFlag,
      onlyDeleted: onlyDeletedFlag
    });
  }
}

module.exports = SearchChapter;
