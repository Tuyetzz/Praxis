// src/domain/entities/Answer.js
class Answer {
  constructor({ 
    id, attemptId, questionId, selectedOptionIds, 
    value, isCorrect, earnedPoints, answeredAt, flagged,
    createdAt, updatedAt, createdBy, updatedBy, isDeleted 
  }) {
    this.id = id;
    this.attemptId = attemptId;
    this.questionId = questionId;
    this.selectedOptionIds = selectedOptionIds || [];
    this.value = value;
    this.isCorrect = isCorrect;
    this.earnedPoints = earnedPoints || 0;
    this.answeredAt = answeredAt;
    this.flagged = flagged || false;
    
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
    this.isDeleted = isDeleted || false;
  }

  isFillBlank() {
    return !!this.value && (!this.selectedOptionIds || this.selectedOptionIds.length === 0);
  }

  markAsCorrect(points) {
    this.isCorrect = true;
    this.earnedPoints = points;
    this.answeredAt = new Date();
  }
}

module.exports = Answer;