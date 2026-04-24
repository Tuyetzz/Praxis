// src/domain/constants/permissions.js

const PERMISSIONS = Object.freeze({
  USER_VIEW: "user:view",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",

  SUBJECT_VIEW: "subject:view",
  SUBJECT_CREATE: "subject:create",
  SUBJECT_UPDATE: "subject:update",
  SUBJECT_DELETE: "subject:delete",

  CHAPTER_VIEW: "chapter:view",
  CHAPTER_CREATE: "chapter:create",
  CHAPTER_UPDATE: "chapter:update",
  CHAPTER_DELETE: "chapter:delete",

  QUESTION_VIEW: "question:view",
  QUESTION_CREATE: "question:create",
  QUESTION_UPDATE: "question:update",
  QUESTION_DELETE: "question:delete",

  ATTEMPT_VIEW: "attempt:view",
  ATTEMPT_CREATE: "attempt:create",
  ATTEMPT_SUBMIT: "attempt:submit",

  FLASHCARD_DECK_VIEW: "flashcard_deck:view",
  FLASHCARD_DECK_CREATE: "flashcard_deck:create",
  FLASHCARD_DECK_UPDATE: "flashcard_deck:update",
  FLASHCARD_DECK_DELETE: "flashcard_deck:delete",

  FLASHCARD_VIEW: "flashcard:view",
  FLASHCARD_CREATE: "flashcard:create",
  FLASHCARD_UPDATE: "flashcard:update",
  FLASHCARD_DELETE: "flashcard:delete",

  TYPING_TEXT_VIEW: "typing_text:view",
  TYPING_TEXT_CREATE: "typing_text:create",
  TYPING_TEXT_UPDATE: "typing_text:update",
  TYPING_TEXT_DELETE: "typing_text:delete",

  TYPING_RESULT_VIEW: "typing_result:view",
  TYPING_RESULT_CREATE: "typing_result:create",

  ROLE_MANAGE: "role:manage",
  PERMISSION_MANAGE: "permission:manage"
});

const SUPERADMIN_ROLE_NAME = "superadmin";
const ALL_PERMISSIONS_FLAG = "all";

module.exports = {
  PERMISSIONS,
  SUPERADMIN_ROLE_NAME,
  ALL_PERMISSIONS_FLAG
};
