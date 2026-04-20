// src/usecases/attempt/SaveAnswer.js
class SaveAnswer {
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
    const { userId, attemptId, questionId, optionId, selectedOptionIds, value, flagged = false } = payload;

    if (!userId) {
      throw new Error("User is required.");
    }
    if (!attemptId) {
      throw new Error("Attempt ID is required.");
    }
    if (!questionId) {
      throw new Error("Question ID is required.");
    }

    // Validate attempt exists and is still in progress
    const attempt = await this.attemptRepository.findById(attemptId);
    if (!attempt) {
      throw new Error("Attempt not found.");
    }

    if (attempt.userId !== userId) {
      throw new Error("Unauthorized: This attempt does not belong to you.");
    }

    if (attempt.status !== "in_progress") {
      throw new Error("Attempt is no longer in progress.");
    }

    // Check if attempt has expired
    if (attempt.expiresAt && new Date() > new Date(attempt.expiresAt)) {
      throw new Error("Attempt has expired.");
    }

    // Validate question exists and belongs to attempt
    const question = await this.questionRepository.findById(questionId);
    if (!question) {
      throw new Error("Question not found.");
    }

    if (question.chapterId !== attempt.chapterId) {
      throw new Error("Question does not belong to this attempt.");
    }

    // Normalize selectedOptionIds: support both optionId (single) and selectedOptionIds (multiple)
    let normalizedSelectedOptionIds = selectedOptionIds || [];
    if (optionId && (!Array.isArray(normalizedSelectedOptionIds) || normalizedSelectedOptionIds.length === 0)) {
      normalizedSelectedOptionIds = [optionId];
    }

    // Validate answer data based on question type
    if (Array.isArray(normalizedSelectedOptionIds) && normalizedSelectedOptionIds.length > 0) {
      const options = await this.optionRepository.findByQuestionIds([questionId]);
      const validOptionIds = options.map(opt => opt.id);
      const isValid = normalizedSelectedOptionIds.every(id => validOptionIds.includes(id));
      if (!isValid) {
        throw new Error("One or more selected options are invalid.");
      }
    }

    // Prepare answer payload
    const answerPayload = {
      attemptId,
      questionId,
      selectedOptionIds: normalizedSelectedOptionIds.length > 0 ? normalizedSelectedOptionIds : null,
      value: value || null,
      flagged,
      answeredAt: new Date(),
    };

    // Find existing answer for this question in this attempt
    const existingAnswer = await this.answerRepository.findByAttemptAndQuestion(attemptId, questionId);

    let savedAnswer;
    await this.unitOfWork.start();
    try {
      if (existingAnswer) {
        // Update existing answer
        savedAnswer = await this.answerRepository.update(
          existingAnswer.id,
          answerPayload, 
          userId,
          this.unitOfWork.getTx()
        );
      } else {
        // Create new answer
        savedAnswer = await this.answerRepository.create(
          answerPayload,
          userId,
          this.unitOfWork.getTx()
        );
      }

      await this.unitOfWork.commit();
    } catch (err) {
      await this.unitOfWork.rollback();
      throw err;
    }

    // If showAnswerAfterSelect is enabled, return correct answers
    const result = { answer: savedAnswer };
    if (attempt.settings?.showAnswerAfterSelect === true) {
      const correctAnswers = await this.optionRepository.findByQuestionCorrect(questionId);
      result.correctAnswers = correctAnswers;
    }

    return result;
  }
}

module.exports = SaveAnswer;
