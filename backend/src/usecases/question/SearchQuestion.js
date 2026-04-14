// src/usecases/question/SearchQuestion.js
const questionRepository = require('../../infrastructure/repositories/QuestionRepository');

class SearchQuestion {
  async execute(params = {}) {
    const {
      page = 1,
      limit = 10,
      search = null,
      subjectId = null,
      chapterId = null,
      type = null,
      difficulty = null,
      order = 'newest'
    } = params;

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

    return await questionRepository.findWithPagination({
      limit: limitNum,
      offset,
      order: orderBy,
      where
    });
  }
}

module.exports = new SearchQuestion();
