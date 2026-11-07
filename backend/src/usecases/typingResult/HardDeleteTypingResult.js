// src/usecases/typingResult/HardDeleteTypingResult.js
const { SUPERADMIN_ROLE_NAME } = require("../../domain/constants/permissions");

function isAdminOrSuperadmin(roles = []) {
  const normalized = Array.isArray(roles) ? roles : [roles];
  return normalized.some((role) => {
    const value = String(role || "").toLowerCase();
    return value === "admin" || value === SUPERADMIN_ROLE_NAME.toLowerCase();
  });
}

class HardDeleteTypingResult {
  constructor({ typingResultRepository }) {
    this.typingResultRepository = typingResultRepository;
  }

  async execute(payload = {}) {
    const { resultId, requestUserId, requestUserRoles = [] } = payload;

    if (!resultId) {
      throw new Error("Typing result ID is required.");
    }
    if (!requestUserId) {
      throw new Error("User is required.");
    }

    const result = await this.typingResultRepository.findByIdIncludingDeleted(resultId);
    if (!result) {
      throw new Error("Typing result not found.");
    }

    const canDeleteAny = isAdminOrSuperadmin(requestUserRoles);
    if (!canDeleteAny && result.userId !== requestUserId) {
      throw new Error("Forbidden: You cannot delete this typing result.");
    }

    await this.typingResultRepository.hardDelete(resultId);
    return { success: true };
  }
}

module.exports = HardDeleteTypingResult;
