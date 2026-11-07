// src/usecases/attempt/HardDeleteAttempt.js
const { SUPERADMIN_ROLE_NAME } = require("../../domain/constants/permissions");

function isAdminOrSuperadmin(roles = []) {
  const normalized = Array.isArray(roles) ? roles : [roles];
  return normalized.some((role) => {
    const value = String(role || "").toLowerCase();
    return value === "admin" || value === SUPERADMIN_ROLE_NAME.toLowerCase();
  });
}

class HardDeleteAttempt {
  constructor({ attemptRepository, attemptQuestionRepository, unitOfWork }) {
    this.attemptRepository = attemptRepository;
    this.attemptQuestionRepository = attemptQuestionRepository;
    this.unitOfWork = unitOfWork;
  }

  async execute(payload = {}) {
    const { attemptId, requestUserId, requestUserRoles = [] } = payload;

    if (!attemptId) {
      throw new Error("Attempt ID is required.");
    }
    if (!requestUserId) {
      throw new Error("User is required.");
    }

    const attempt = await this.attemptRepository.findByIdIncludingDeleted(attemptId);
    if (!attempt) {
      throw new Error("Attempt not found.");
    }

    const canDeleteAny = isAdminOrSuperadmin(requestUserRoles);
    if (!canDeleteAny && attempt.userId !== requestUserId) {
      throw new Error("Forbidden: You cannot delete this attempt.");
    }

    await this.unitOfWork.start();
    try {
      const tx = this.unitOfWork.getTx();
      await this.attemptQuestionRepository.hardDeleteByAttemptId(attemptId, tx);
      await this.attemptRepository.hardDelete(attemptId, tx);
      await this.unitOfWork.commit();
      return { success: true };
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}

module.exports = HardDeleteAttempt;
