// src/usecases/typingText/RestoreTypingText.js
const { SUPERADMIN_ROLE_NAME } = require("../../domain/constants/permissions");

function isAdminOrSuperadmin(roles = []) {
  const normalized = Array.isArray(roles) ? roles : [roles];
  return normalized.some((role) => {
    const value = String(role || "").toLowerCase();
    return value === "admin" || value === SUPERADMIN_ROLE_NAME.toLowerCase();
  });
}

class RestoreTypingText {
  constructor({ typingTextRepository }) {
    this.typingTextRepository = typingTextRepository;
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

    const canRestoreAny = isAdminOrSuperadmin(requestUserRoles);
    if (!canRestoreAny && text.authorId !== requestUserId) {
      throw new Error("Forbidden: You cannot restore this typing text.");
    }

    return this.typingTextRepository.restore(textId);
  }
}

module.exports = RestoreTypingText;
