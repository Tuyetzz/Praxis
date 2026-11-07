// src/usecases/attempt/GetAttemptGrade.js
const QUESTIONS_TYPE_ENUM = require("../../domain/constants/questions_type_enum");

class GetAttemptGrade {
  constructor({
    attemptRepository,
    answerRepository,
    questionRepository,
    optionRepository,
    attemptQuestionRepository,
    resultSummaryRepository,
  }) {
    this.attemptRepository = attemptRepository;
    this.answerRepository = answerRepository;
    this.questionRepository = questionRepository;
    this.optionRepository = optionRepository;
    this.attemptQuestionRepository = attemptQuestionRepository;
    this.resultSummaryRepository = resultSummaryRepository;
  }

  async execute(payload = {}) {
    const { attemptId, userId } = payload;

    if (!attemptId) {
      throw new Error("Attempt ID is required.");
    }

    // Fetch the attempt
    const attempt = await this.attemptRepository.findById(attemptId);
    if (!attempt) {
      throw new Error("Attempt not found.");
    }

    // Verify ownership
    if (userId && attempt.userId !== userId) {
      throw new Error("Unauthorized: This attempt does not belong to you.");
    }

    // Check if attempt is graded
    if (attempt.status !== "graded") {
      throw new Error("Attempt has not been graded yet.");
    }


    // Lấy toàn bộ danh sách câu hỏi của attempt
    const attemptQuestions = await this.attemptQuestionRepository.findByAttempt(attemptId);
    const questionIds = attemptQuestions.map(aq => aq.questionId);
    const questions = await this.questionRepository.findByIds(questionIds);
    const options = await this.optionRepository.findByQuestionIds(questionIds);
    const answers = await this.answerRepository.findByAttemptId(attemptId);

    // Map nhanh
    const questionMap = {};
    questions.forEach(q => (questionMap[q.id] = q));
    const optionsMap = {};
    options.forEach(opt => {
      if (!optionsMap[opt.questionId]) optionsMap[opt.questionId] = [];
      optionsMap[opt.questionId].push(opt);
    });
    const answerMap = {};
    answers.forEach(a => { answerMap[a.questionId] = a; });

    // Build detailed answer results cho đủ số câu hỏi (không tính lại summary)
    const detailedAnswers = attemptQuestions.map(aq => {
      const question = questionMap[aq.questionId];
      const questionOptions = optionsMap[aq.questionId] || [];
      const optionTextById = new Map(questionOptions.map(option => [option.id, option.text]));
      const answer = answerMap[aq.questionId];

      let status = "blank";
      let points = 0;
      let selectedAnswer = null;
      if (answer) {
        if (answer.selectedOptionIds?.length > 0 || answer.value) {
          status = answer.isCorrect ? "correct" : "wrong";
        }
        points = answer.earnedPoints || 0;
        selectedAnswer = this.formatSelectedAnswer(answer, question?.type, optionTextById);
      }
      return {
        questionId: aq.questionId,
        questionType: question?.type,
        questionText: question?.text,
        points,
        maxPoints: question?.points || 0,
        status,
        selectedAnswer,
        correctAnswer: this.formatCorrectAnswer(questionOptions, question?.type),
      };
    });

    // Get result summary (persisted at submit time)
    let resultSummary = await this.resultSummaryRepository.findByAttempt(attemptId);
    // Nếu chưa có (dữ liệu cũ), fallback về 0
    const correctCount = resultSummary?.correctCount ?? 0;
    const wrongCount = resultSummary?.wrongCount ?? 0;
    const blankCount = resultSummary?.blankCount ?? 0;
    const rank = resultSummary?.rank ?? null;
    const totalQuestions = attemptQuestions.length;
    const maxScore = attempt.maxScore || 0;
    const totalEarnedPoints = attempt.score || 0;
    const accuracyPercentage = totalQuestions > 0
      ? parseFloat(((correctCount / totalQuestions) * 100).toFixed(2))
      : 0;

    return {
      attempt: {
        id: attempt.id,
        userId: attempt.userId,
        subjectId: attempt.subjectId,
        chapterId: attempt.chapterId,
        mode: attempt.mode,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        timeSpentSeconds: attempt.timeSpentSeconds,
        durationMinutes: attempt.durationMinutes,
        score: attempt.score,
        maxScore,
      },
      summary: {
        correctCount,
        wrongCount,
        blankCount,
        totalQuestions,
        totalEarnedPoints,
        maxScore,
        accuracyPercentage,
        isPassed: accuracyPercentage >= 50,
        rank,
      },
      detailedAnswers,
    };
  }

  formatSelectedAnswer(answer, questionType, optionTextById) {
    if (questionType === QUESTIONS_TYPE_ENUM.FILL_BLANK) {
      return answer.value || null;
    }
    if (!answer.selectedOptionIds?.length) return [];
    return answer.selectedOptionIds.map((id) => ({
      id,
      text: optionTextById?.get(id) || "",
    }));
  }

  formatCorrectAnswer(options, questionType) {
    if (questionType === QUESTIONS_TYPE_ENUM.FILL_BLANK) {
      const correctOption = options.find(o => o.isCorrect);
      return correctOption?.text || null;
    }
    return options.filter(o => o.isCorrect).map(o => ({
      id: o.id,
      text: o.text,
    }));
  }
}

module.exports = GetAttemptGrade;
