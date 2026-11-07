// src/usecases/attempt/GetAttempts.js
const { SUPERADMIN_ROLE_NAME } = require("../../domain/constants/permissions");

function isAdminOrSuperadmin(roles = []) {
  const normalized = Array.isArray(roles) ? roles : [roles];
  return normalized.some((role) => {
    const value = String(role || "").toLowerCase();
    return value === "admin" || value === SUPERADMIN_ROLE_NAME.toLowerCase();
  });
}

class GetAttempts {
  constructor({ attemptRepository }) {
    this.attemptRepository = attemptRepository;
  }

  async execute(params = {}, requestUserRoles = []) {
    if (!isAdminOrSuperadmin(requestUserRoles)) {
      throw new Error("Forbidden: You cannot view all attempts.");
    }

    const { page = 1, limit = 10, status = null, userId = null } = params;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    return await this.attemptRepository.findWithPagination({
      limit: limitNum,
      offset,
      order: [["createdAt", "DESC"]],
      where
    });
  }
}

module.exports = GetAttempts;
