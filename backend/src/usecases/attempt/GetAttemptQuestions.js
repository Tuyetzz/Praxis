// src/usecases/attempt/GetAttemptQuestions.js
class GetAttemptQuestions {
  constructor({ attemptRepository, attemptQuestionRepository, questionRepository, optionRepository }) {
    this.attemptRepository = attemptRepository;
    this.attemptQuestionRepository = attemptQuestionRepository;
    this.questionRepository = questionRepository;
    this.optionRepository = optionRepository;
  }

  applyOptionOrder(options = [], optionOrder = []) {
    if (!Array.isArray(optionOrder) || optionOrder.length === 0) return options;

    const orderIds = optionOrder.map((id) => String(id));
    const remaining = new Map(options.map((opt) => [String(opt.id), opt]));
    const ordered = [];

    for (const id of orderIds) {
      const opt = remaining.get(id);
      if (opt) {
        ordered.push(opt);
        remaining.delete(id);
      }
    }

    for (const opt of options) {
      if (remaining.has(String(opt.id))) {
        ordered.push(opt);
        remaining.delete(String(opt.id));
      }
    }

    return ordered;
  }

  async execute(payload = {}) {
    const { attemptId, userId } = payload;

    if (!attemptId) {
      throw new Error("Attempt ID is required.");
    }

    const attempt = await this.attemptRepository.findById(attemptId);
    if (!attempt) {
      throw new Error("Attempt not found.");
    }

    if (userId && attempt.userId !== userId) {
      throw new Error("Unauthorized: This attempt does not belong to you.");
    }

    const attemptQuestions = await this.attemptQuestionRepository.findByAttempt(attemptId);
    if (!attemptQuestions.length) {
      return [];
    }

    const questionIds = attemptQuestions.map((aq) => aq.questionId);
    const questions = await this.questionRepository.findByIds(questionIds);
    const options = await this.optionRepository.findByQuestionIds(questionIds);

    const questionMap = {};
    questions.forEach((question) => {
      questionMap[question.id] = question;
    });

    const optionsMap = {};
    options.forEach((option) => {
      if (!optionsMap[option.questionId]) optionsMap[option.questionId] = [];
      optionsMap[option.questionId].push(option);
    });

    return [...attemptQuestions]
      .sort((a, b) => {
        if (a.pageIndex !== b.pageIndex) return a.pageIndex - b.pageIndex;
        // sequence giữ đúng thứ tự đã xáo trộn khi start attempt
        if (a.sequence !== b.sequence) return a.sequence - b.sequence;
        // fallback cho dữ liệu cũ chưa có sequence (tất cả = 0)
        return String(a.questionId).localeCompare(String(b.questionId));
      })
      .map((aq) => {
        const question = questionMap[aq.questionId] || null;
        const questionOptions = this.applyOptionOrder(optionsMap[aq.questionId] || [], aq.optionOrder);
        return {
          ...aq,
          question: question ? { ...question, options: questionOptions } : null,
        };
      });
  }
}

module.exports = GetAttemptQuestions;
