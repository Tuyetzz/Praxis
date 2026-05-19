// src/usecases/question/SearchQuestion.js
class SearchQuestion {
  constructor({ questionRepository }) {
    this.questionRepository = questionRepository;
  }

  async execute(params = {}) {
    const {
      page = 1,
      limit = 10,
      search = null,
      subjectId = null,
      chapterId = null,
      type = null,
      difficulty = null,
      order = 'newest',
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
    let orderBy = [["createdAt", "DESC"]];
    if (order === 'difficulty') {
      orderBy = [["difficulty", "ASC"]];
    } else if (order === 'points') {
      orderBy = [["points", "DESC"]];
    } else if (order === 'oldest') {
      orderBy = [["createdAt", "ASC"]];
    }

    // Build where clause
    const where = {};
    if (search) {
      where.text = { [require('sequelize').Op.like]: `%${search}%` };
    }
    if (subjectId) where.subjectId = subjectId;
    if (chapterId) where.chapterId = chapterId;
    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;

    return await this.questionRepository.findWithPagination({
      limit: limitNum,
      offset,
      order: orderBy,
      where,
      includeDeleted: includeDeletedFlag,
      onlyDeleted: onlyDeletedFlag
    });
  }
}

module.exports = SearchQuestion;
