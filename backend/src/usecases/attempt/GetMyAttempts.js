// src/usecases/attempt/GetMyAttempts.js
class GetMyAttempts {
  constructor({ attemptRepository }) {
    this.attemptRepository = attemptRepository;
  }

  async execute(params = {}, userId) {
    if (!userId) {
      throw new Error("User is required.");
    }

    const { page = 1, limit = 10, status = null } = params;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const where = { userId };
    if (status) where.status = status;

    return await this.attemptRepository.findWithPagination({
      limit: limitNum,
      offset,
      order: [["createdAt", "DESC"]],
      where
    });
  }
}

module.exports = GetMyAttempts;
