// src/usecases/attempt/SubmitAttempt.js
const QUESTIONS_TYPE_ENUM = require("../../domain/constants/questions_type_enum");

class SubmitAttempt {
  constructor({
    attemptRepository,
    answerRepository,
    questionRepository,
    optionRepository,
    unitOfWork,
  }) {
    this.attemptRepository = attemptRepository;
    this.answerRepository = answerRepository;
    this.questionRepository = questionRepository;
    this.optionRepository = optionRepository;
    this.unitOfWork = unitOfWork;
  }

  async execute(payload = {}) {
    const { userId, attemptId } = payload;

    if (!userId) {
      throw new Error("User is required.");
    }
    if (!attemptId) {
      throw new Error("Attempt ID is required.");
    }

    // Validate attempt exists and belongs to user
    const attempt = await this.attemptRepository.findById(attemptId);
    if (!attempt) {
      throw new Error("Attempt not found.");
    }

    if (attempt.userId !== userId) {
      throw new Error("Unauthorized: This attempt does not belong to you.");
    }

    if (attempt.status !== "in_progress") {
      throw new Error("Attempt is not in progress or has already been submitted.");
    }

    // Calculate time spent
    const startedAt = new Date(attempt.startedAt);
    const now = new Date();
    const timeSpentSeconds = Math.floor((now - startedAt) / 1000);

    // Start transaction for submit + grade
    await this.unitOfWork.start();
    try {
      // Step 1: Mark as submitted
      const submittedAttemptPayload = {
        status: "submitted",
        submittedAt: now,
        timeSpentSeconds: Math.min(timeSpentSeconds, attempt.durationMinutes * 60),
      };
      console.log("Submitting attempt with payload:", submittedAttemptPayload);

      await this.attemptRepository.update(
        attemptId,
        submittedAttemptPayload,
        userId,
        this.unitOfWork.getTx()
      );

      // Step 2: Fetch all data for grading
      const answers = await this.answerRepository.findByAttemptId(attemptId);
      const questionIds = answers.map(a => a.questionId);
      const questions = await this.questionRepository.findByIds(questionIds);
      const options = await this.optionRepository.findByQuestionIds(questionIds);

      // Create maps for quick lookup
      const questionMap = {};
      questions.forEach(q => questionMap[q.id] = q);
      const optionsMap = {};
      options.forEach(opt => {
        if (!optionsMap[opt.questionId]) optionsMap[opt.questionId] = [];
        optionsMap[opt.questionId].push(opt);
      });

      // Step 3: Grade each answer
      let totalEarnedPoints = 0;
      const gradeUpdates = [];

      for (const answer of answers) {
        const question = questionMap[answer.questionId];
        const questionOptions = optionsMap[answer.questionId] || [];

        const gradeResult = this.gradeAnswer(answer, question, questionOptions);
        totalEarnedPoints += gradeResult.earnedPoints;

        // Prepare update for this answer
        gradeUpdates.push({
          answerId: answer.id,
          isCorrect: gradeResult.isCorrect,
          earnedPoints: gradeResult.earnedPoints,
        });
      }

      // Step 4: Update all answers with grading results (parallelize for better performance)
      await Promise.all(
        gradeUpdates.map(update =>
          this.answerRepository.update(
            update.answerId,
            {
              isCorrect: update.isCorrect,
              earnedPoints: update.earnedPoints,
            },
            userId,
            this.unitOfWork.getTx()
          )
        )
      );

      // Step 5: Mark as graded and set score
      const maxScore = answers.reduce((sum, a) => {
        const question = questionMap[a.questionId];
        return sum + (question?.points || 0);
      }, 0);
      const gradedAttemptPayload = {
        status: "graded",
        score: totalEarnedPoints,
      };

      const gradedAttempt = await this.attemptRepository.update(
        attemptId,
        gradedAttemptPayload,
        userId,
        this.unitOfWork.getTx()
      );

      await this.unitOfWork.commit();

      return {
        attempt: await this.attemptRepository.findById(attemptId), // Return updated attempt
        totalEarnedPoints,
        maxScore,
        correctCount: gradeUpdates.filter(u => u.isCorrect).length,
        totalCount: answers.length,
      };
    } catch (err) {
      await this.unitOfWork.rollback();
      throw err;
    }
  }

  gradeAnswer(answer, question, options) {
    switch (question.type) {
      case QUESTIONS_TYPE_ENUM.SINGLE:
      case QUESTIONS_TYPE_ENUM.TRUE_FALSE:
        return this.gradeSingleOrTrueFalse(answer, question, options);
      case QUESTIONS_TYPE_ENUM.MULTIPLE:
        return this.gradeMultiple(answer, question, options);
      case QUESTIONS_TYPE_ENUM.FILL_BLANK:
        return this.gradeFillBlank(answer, question, options);
      default:
        throw new Error(`Unknown question type: ${question.type}`);
    }
  }

  gradeSingleOrTrueFalse(answer, question, options) {
    const correctOption = options.find(o => o.isCorrect);
    const isCorrect = answer.selectedOptionIds?.[0] === correctOption?.id;
    return {
      isCorrect,
      earnedPoints: isCorrect ? (question?.points || 0) : 0,
    };
  }

  gradeMultiple(answer, question, options) {
    const correctOptionIds = options.filter(o => o.isCorrect).map(o => o.id);
    const selectedIds = answer.selectedOptionIds || [];
    
    // Must have exact match: same IDs, same count
    const isCorrect = selectedIds.length === correctOptionIds.length &&
      selectedIds.every(id => correctOptionIds.includes(id));

    return {
      isCorrect,
      earnedPoints: isCorrect ? (question?.points || 0) : 0,
    };
  }

  gradeFillBlank(answer, question, options) {
    const correctOption = options.find(o => o.isCorrect);
    const userValue = answer.value?.trim().toLowerCase() || "";
    const correctValue = correctOption?.text?.trim().toLowerCase() || "";
    const isCorrect = userValue === correctValue;

    return {
      isCorrect,
      earnedPoints: isCorrect ? (question?.points || 0) : 0,
    };
  }
}

module.exports = SubmitAttempt;
