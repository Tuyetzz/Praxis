// src/infrastructure/database/models/index.js
const sequelize = require("../config/db");

// Import Models
const UserModel = require("./UserModel");
const RoleModel = require("./RoleModel");
const PermissionModel = require("./PermissionModel");
const UserRoleModel = require("./UserRoleModel");
const RolePermissionModel = require("./RolePermissionModel");
const SubjectModel = require("./SubjectModel");
const ChapterModel = require("./ChapterModel");
const QuestionModel = require("./QuestionModel");
const OptionModel = require("./OptionModel");
const AttemptModel = require("./AttemptModel");
const AttemptQuestionModel = require("./AttemptQuestionModel");
const AnswerModel = require("./AnswerModel");
const ResultSummaryModel = require("./ResultSummaryModel");
const FlashcardDeckModel = require("./FlashcardDeckModel");
const FlashcardModel = require("./FlashcardModel");
const TypingTextModel = require("./TypingTextModel");
const TypingResultModel = require("./TypingResultModel");
const AuthSessionModel = require("./AuthSessionModel");
const AuditLogModel = require("./AuditLogModel");

// --- ĐỊNH NGHĨA QUAN HỆ (ASSOCIATIONS) ---

// 1. RBAC (User - Role - Permission)
UserModel.belongsToMany(RoleModel, { through: UserRoleModel, foreignKey: "userId", otherKey: "roleId" });
RoleModel.belongsToMany(UserModel, { through: UserRoleModel, foreignKey: "roleId", otherKey: "userId" });

RoleModel.belongsToMany(PermissionModel, { through: RolePermissionModel, foreignKey: "roleId", otherKey: "permissionId" });
PermissionModel.belongsToMany(RoleModel, { through: RolePermissionModel, foreignKey: "permissionId", otherKey: "roleId" });

// 2. Auth & Logs
UserModel.hasMany(AuthSessionModel, { foreignKey: "userId", as: "sessions", onDelete: "CASCADE" });
AuthSessionModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });

UserModel.hasMany(AuditLogModel, { foreignKey: "actorUserId", as: "auditLogs", onDelete: "SET NULL" });
AuditLogModel.belongsTo(UserModel, { foreignKey: "actorUserId", as: "actor" });

// 3. Nội dung học tập (Subject - Chapter - Question - Option)
SubjectModel.hasMany(ChapterModel, { foreignKey: "subjectId", as: "chapters", onDelete: "CASCADE" });
ChapterModel.belongsTo(SubjectModel, { foreignKey: "subjectId", as: "subject" });

SubjectModel.hasMany(QuestionModel, { foreignKey: "subjectId", as: "questions", onDelete: "CASCADE" });
QuestionModel.belongsTo(SubjectModel, { foreignKey: "subjectId", as: "subject" });

ChapterModel.hasMany(QuestionModel, { foreignKey: "chapterId", as: "questions", onDelete: "CASCADE" });
QuestionModel.belongsTo(ChapterModel, { foreignKey: "chapterId", as: "chapter" });

QuestionModel.hasMany(OptionModel, { foreignKey: "questionId", as: "options", onDelete: "CASCADE" });
OptionModel.belongsTo(QuestionModel, { foreignKey: "questionId", as: "question" });

// 4. Lượt làm bài & Kết quả (Attempt - Answer - Summary)
UserModel.hasMany(AttemptModel, { foreignKey: "userId", as: "attempts", onDelete: "CASCADE" });
AttemptModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });

SubjectModel.hasMany(AttemptModel, { foreignKey: "subjectId", as: "attempts", onDelete: "SET NULL" });
AttemptModel.belongsTo(SubjectModel, { foreignKey: "subjectId", as: "subject" });

ChapterModel.hasMany(AttemptModel, { foreignKey: "chapterId", as: "attempts", onDelete: "SET NULL" });
AttemptModel.belongsTo(ChapterModel, { foreignKey: "chapterId", as: "chapter" });

AttemptModel.hasMany(AttemptQuestionModel, { foreignKey: "attemptId", as: "attemptQuestions", onDelete: "CASCADE" });
AttemptQuestionModel.belongsTo(AttemptModel, { foreignKey: "attemptId", as: "attempt" });

QuestionModel.hasMany(AttemptQuestionModel, { foreignKey: "questionId", as: "attemptQuestions", onDelete: "CASCADE" });
AttemptQuestionModel.belongsTo(QuestionModel, { foreignKey: "questionId", as: "question" });

AttemptModel.hasMany(AnswerModel, { foreignKey: "attemptId", as: "answers", onDelete: "CASCADE" });
AnswerModel.belongsTo(AttemptModel, { foreignKey: "attemptId", as: "attempt" });

QuestionModel.hasMany(AnswerModel, { foreignKey: "questionId", as: "answers", onDelete: "CASCADE" });
AnswerModel.belongsTo(QuestionModel, { foreignKey: "questionId", as: "question" });

OptionModel.hasMany(AnswerModel, { foreignKey: "optionId", as: "answers", onDelete: "SET NULL" });
AnswerModel.belongsTo(OptionModel, { foreignKey: "optionId", as: "option" });

AttemptModel.hasOne(ResultSummaryModel, { foreignKey: "attemptId", as: "resultSummary", onDelete: "CASCADE" });
ResultSummaryModel.belongsTo(AttemptModel, { foreignKey: "attemptId", as: "attempt" });

// 5. Flashcards
UserModel.hasMany(FlashcardDeckModel, { foreignKey: "userId", as: "decks", onDelete: "CASCADE" });
FlashcardDeckModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });

FlashcardDeckModel.hasMany(FlashcardModel, { foreignKey: "deckId", as: "cards", onDelete: "CASCADE" });
FlashcardModel.belongsTo(FlashcardDeckModel, { foreignKey: "deckId", as: "deck" });

// 6. Typing
UserModel.hasMany(TypingTextModel, { foreignKey: "authorId", as: "typingTexts", onDelete: "CASCADE" });
TypingTextModel.belongsTo(UserModel, { foreignKey: "authorId", as: "author" });

UserModel.hasMany(TypingResultModel, { foreignKey: "userId", as: "typingResults", onDelete: "CASCADE" });
TypingResultModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });

TypingTextModel.hasMany(TypingResultModel, { foreignKey: "textId", as: "results", onDelete: "CASCADE" });
TypingResultModel.belongsTo(TypingTextModel, { foreignKey: "textId", as: "text" });

module.exports = {
  sequelize,
  UserModel,
  RoleModel,
  PermissionModel,
  UserRoleModel,
  RolePermissionModel,
  SubjectModel,
  ChapterModel,
  QuestionModel,
  OptionModel,
  AttemptModel,
  AttemptQuestionModel,
  AnswerModel,
  ResultSummaryModel,
  FlashcardDeckModel,
  FlashcardModel,
  TypingTextModel,
  TypingResultModel,
  AuthSessionModel,
  AuditLogModel
};