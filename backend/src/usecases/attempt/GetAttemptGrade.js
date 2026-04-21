// src/usecases/attempt/GetAttemptGrade.js
const QUESTIONS_TYPE_ENUM = require("../../domain/constants/questions_type_enum");

class GetAttemptGrade {
  constructor({
    attemptRepository,
    answerRepository,
    questionRepository,
    optionRepository,
    resultSummaryRepository,
  }) {
    this.attemptRepository = attemptRepository;
    this.answerRepository = answerRepository;
    this.questionRepository = questionRepository;
    this.optionRepository = optionRepository;
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

    // Fetch all answers for this attempt
    const answers = await this.answerRepository.findByAttemptId(attemptId);

    // Fetch questions and options
    const questionIds = answers.map(a => a.questionId);
    const questions = await this.questionRepository.findByIds(questionIds);
    const options = await this.optionRepository.findByQuestionIds(questionIds);

    // Create maps for quick lookup
    const questionMap = {};
    questions.forEach(q => (questionMap[q.id] = q));

    const optionsMap = {};
    options.forEach(opt => {
      if (!optionsMap[opt.questionId]) optionsMap[opt.questionId] = [];
      optionsMap[opt.questionId].push(opt);
    });

    // Calculate statistics
    let correctCount = 0;
    let wrongCount = 0;
    let blankCount = 0;
    let totalEarnedPoints = 0;

    // Build detailed answer results
    const detailedAnswers = answers.map(answer => {
      const question = questionMap[answer.questionId];
      const questionOptions = optionsMap[answer.questionId] || [];

      // Determine answer status
      let status = "blank";
      if (answer.selectedOptionIds?.length > 0 || answer.value) {
        status = answer.isCorrect ? "correct" : "wrong";
      }

      if (status === "correct") correctCount++;
      else if (status === "wrong") wrongCount++;
      else blankCount++;

      totalEarnedPoints += answer.earnedPoints || 0;

      return {
        questionId: answer.questionId,
        questionType: question?.type,
        questionText: question?.text,
        points: answer.earnedPoints || 0,
        maxPoints: question?.points || 0,
        status,
        selectedAnswer: this.formatSelectedAnswer(answer, question?.type),
        correctAnswer: this.formatCorrectAnswer(questionOptions, question?.type),
      };
    });

    // Get or calculate result summary
    let resultSummary = await this.resultSummaryRepository.findByAttempt(attemptId);
    if (!resultSummary) {
      // Create result summary if it doesn't exist
      resultSummary = {
        attemptId,
        correctCount,
        wrongCount,
        blankCount,
        rank: null,
      };
    }

    const totalQuestions = attempt.settings?.totalQuestions || answers.length;
    const maxScore = attempt.maxScore || 0;
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
        rank: resultSummary?.rank || null,
      },
      detailedAnswers,
    };
  }

  formatSelectedAnswer(answer, questionType) {
    if (questionType === QUESTIONS_TYPE_ENUM.FILL_BLANK) {
      return answer.value || null;
    }
    return answer.selectedOptionIds || [];
  }

  formatCorrectAnswer(options, questionType) {
    if (questionType === QUESTIONS_TYPE_ENUM.FILL_BLANK) {
      const correctOption = options.find(o => o.isCorrect);
      return correctOption?.text || null;
    }
    return options.filter(o => o.isCorrect).map(o => o.id);
  }
}

module.exports = GetAttemptGrade;
