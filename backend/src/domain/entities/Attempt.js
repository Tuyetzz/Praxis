// src/domain/entities/Attempt.js
class Attempt {
  constructor({
    id, userId, subjectId, chapterId, mode, status,
    startedAt, submittedAt, expiresAt,
    durationMinutes, timeSpentSeconds, score, maxScore, settings,
    createdAt, updatedAt, createdBy, updatedBy, isDeleted
  }) {
    this.id = id;
    this.userId = userId;
    this.subjectId = subjectId;
    this.chapterId = chapterId;
    this.mode = mode || 'practice';
    this.status = status || 'draft';
    this.startedAt = startedAt;
    this.submittedAt = submittedAt;
    this.expiresAt = expiresAt;
    this.durationMinutes = durationMinutes;
    this.timeSpentSeconds = timeSpentSeconds || 0;
    this.score = score || 0;
    this.maxScore = maxScore || 0;
    this.settings = settings || {};

    // Base fields
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
    this.isDeleted = isDeleted || false;

    this.validate();
  }

  validate() {
    if (this.expiresAt && this.startedAt && new Date(this.expiresAt) <= new Date(this.startedAt)) {
      throw new Error("expiresAt phải lớn hơn startedAt");
    }
    if (this.durationMinutes < 1) {
      throw new Error("durationMinutes phải ít nhất là 1 phút");
    }
  }

  isExpired() {
    if (this.status === 'submitted' || this.status === 'graded') return false;
    return this.expiresAt && new Date() > new Date(this.expiresAt);
  }

  complete(finalScore) {
    this.score = finalScore;
    this.submittedAt = new Date();
    this.status = 'submitted';
  }
}

module.exports = Attempt;