// src/domain/entities/ResultSummary.js
const BaseEntity = require("./BaseEntity");

class ResultSummary extends BaseEntity {
  constructor(data) {
    super(data);
    this.attemptId = data.attemptId;
    this.correctCount = data.correctCount || 0;
    this.wrongCount = data.wrongCount || 0;
    this.blankCount = data.blankCount || 0;
    this.rank = data.rank || null;
  }

  // Domain Logic: Tính tổng số câu hỏi đã xử lý
  getTotalQuestions() {
    return this.correctCount + this.wrongCount + this.blankCount;
  }

  // Domain Logic: Tính tỷ lệ chính xác (%)
  getAccuracyPercentage() {
    const total = this.getTotalQuestions();
    if (total === 0) return 0;
    return parseFloat(((this.correctCount / total) * 100).toFixed(2));
  }

  // Domain Logic: Kiểm tra xem User có đạt (Pass) hay không (ví dụ trên 50%)
  isPassed(passingScore = 50) {
    return this.getAccuracyPercentage() >= passingScore;
  }
}

module.exports = ResultSummary;