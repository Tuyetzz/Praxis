// src/usecases/typingText/HardDeleteTypingText.js
const { SUPERADMIN_ROLE_NAME } = require("../../domain/constants/permissions");

function isAdminOrSuperadmin(roles = []) {
  const normalized = Array.isArray(roles) ? roles : [roles];
  return normalized.some((role) => {
    const value = String(role || "").toLowerCase();
    return value === "admin" || value === SUPERADMIN_ROLE_NAME.toLowerCase();
  });
}

class HardDeleteTypingText {
  constructor({ typingTextRepository, typingResultRepository, unitOfWork }) {
    this.typingTextRepository = typingTextRepository;
    this.typingResultRepository = typingResultRepository;
    this.unitOfWork = unitOfWork;
  }

  async execute(payload = {}) {
    const { textId, requestUserId, requestUserRoles = [] } = payload;

    if (!textId) {
      throw new Error("Typing text ID is required.");
    }
    if (!requestUserId) {
      throw new Error("User is required.");
    }

    const text = await this.typingTextRepository.findByIdIncludingDeleted(textId);
    if (!text) {
      throw new Error("Typing text not found.");
    }

    const canDeleteAny = isAdminOrSuperadmin(requestUserRoles);
    if (!canDeleteAny && text.authorId !== requestUserId) {
      throw new Error("Forbidden: You cannot delete this typing text.");
    }

    await this.unitOfWork.start();
    try {
      const tx = this.unitOfWork.getTx();
      await this.typingResultRepository.hardDeleteByTextId(textId, tx);
      await this.typingTextRepository.hardDelete(textId, tx);
      await this.unitOfWork.commit();
      return { success: true };
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}

module.exports = HardDeleteTypingText;
