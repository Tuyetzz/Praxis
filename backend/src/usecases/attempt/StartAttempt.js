// src/usecases/attempt/StartAttempt.js
const sequelize = require("../../infrastructure/database/config/db");

class StartAttempt {
  constructor({
    userRepository,
    subjectRepository,
    chapterRepository,
    questionRepository,
    optionRepository,
    attemptRepository,
    attemptQuestionRepository,
    unitOfWork,
  }) {
    this.userRepository = userRepository;
    this.subjectRepository = subjectRepository;
    this.chapterRepository = chapterRepository;
    this.questionRepository = questionRepository;
    this.optionRepository = optionRepository;
    this.attemptRepository = attemptRepository;
    this.attemptQuestionRepository = attemptQuestionRepository;
    this.unitOfWork = unitOfWork;
  }

  async execute(payload = {}) {
    const { userId, subjectId, chapterId, mode = "practice", settings = {}, durationMinutes: customDurationMinutes } = payload;

    if (!userId) {
      throw new Error("User is required.");
    }
    if (!subjectId) {
      throw new Error("Subject is required.");
    }
    if (!chapterId) {
      throw new Error("Chapter is required.");
    }

    const validModes = ["exam", "practice"];
    if (!validModes.includes(mode)) {
      throw new Error("Mode must be exam or practice.");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const subject = await this.subjectRepository.findById(subjectId);
    if (!subject) {
      throw new Error("Subject not found.");
    }

    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) {
      throw new Error("Chapter not found.");
    }

    if (chapter.subjectId !== subjectId) {
      throw new Error("Chapter does not belong to selected subject.");
    }


    // Only include questions that are not soft-deleted (findByChapter already filters isDeleted=false)
    const allChapterQuestions = await this.questionRepository.findByChapter(chapterId);
    const chapterQuestions = allChapterQuestions.filter((question) => question.subjectId === subjectId);

    if (!chapterQuestions.length) {
      throw new Error("No question available in selected chapter.");
    }

    const orderedByDefault = [...chapterQuestions].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (aTime !== bTime) return aTime - bTime;
      return String(a.id).localeCompare(String(b.id));
    });

    // Clamp default paging to question count if not provided
    let normalizedSettings = this.normalizeSettings(settings, mode);
    let { from, to } = normalizedSettings.paging;
    if (settings.paging === undefined) {
      from = 1;
      to = orderedByDefault.length;
      normalizedSettings.paging = { from, to };
    } else if (to > orderedByDefault.length) {
      to = orderedByDefault.length;
      normalizedSettings.paging = { from, to };
    }

    if (from > orderedByDefault.length) {
      throw new Error("Paging start is out of question range.");
    }

    const selectedQuestions = orderedByDefault.slice(from - 1, to);
    if (!selectedQuestions.length) {
      throw new Error("No question selected from paging range.");
    }

    const finalQuestions = normalizedSettings.shuffleQuestions
      ? this.shuffleArray([...selectedQuestions])
      : selectedQuestions;

    const totalQuestions = finalQuestions.length;
    const totalSeconds = totalQuestions * normalizedSettings.questionTimeSeconds;
    let durationMinutes;
    let expiresAt;
    const startedAt = new Date();
    if (customDurationMinutes && Number.isFinite(Number(customDurationMinutes)) && Number(customDurationMinutes) > 0) {
      durationMinutes = Math.ceil(Number(customDurationMinutes));
      durationMinutes = Math.max(1, durationMinutes);
      expiresAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
    } else {
      durationMinutes = Math.max(1, Math.ceil(totalSeconds / 60));
      expiresAt = new Date(startedAt.getTime() + totalSeconds * 1000);
    }

    const maxScore = finalQuestions.reduce((sum, question) => {
      const points = Number(question.points || 0);
      return sum + points;
    }, 0);

    const finalSettings = {
      ...normalizedSettings,
      paging: { from, to },
      totalQuestions,
      subjectId,
      chapterId,
    };


    let attempt;
    await this.unitOfWork.start();
    try {
      attempt = await this.attemptRepository.create(
        {
          userId,
          subjectId,
          chapterId,
          mode,
          status: "in_progress",
          startedAt,
          expiresAt,
          durationMinutes,
          timeSpentSeconds: 0,
          score: 0,
          maxScore,
          settings: finalSettings,
        },
        userId,
        this.unitOfWork.getTx()
      );


      // Optimize: fetch all options for all questions in one query
      const questionIds = finalQuestions.map(q => q.id);
      const allOptions = await this.optionRepository.findByQuestionIds(questionIds);
      // Group options by questionId
      const optionsByQuestion = {};
      for (const option of allOptions) {
        if (!optionsByQuestion[option.questionId]) optionsByQuestion[option.questionId] = [];
        optionsByQuestion[option.questionId].push(option);
      }

      const attemptQuestionsPayload = finalQuestions.map((question, index) => {
        let optionIds = (optionsByQuestion[question.id] || []).map(opt => opt.id);
        if (mode === "exam") {
          optionIds = this.shuffleArray([...optionIds]);
        }
        return {
          attemptId: attempt.id,
          questionId: question.id,
          pageIndex: Math.floor(index / normalizedSettings.questionsPerPage),
          optionOrder: optionIds,
        };
      });

      await this.attemptQuestionRepository.createMany(
        attemptQuestionsPayload,
        userId,
        this.unitOfWork.getTx()
      );

      await this.unitOfWork.commit();
    } catch (err) {
      await this.unitOfWork.rollback();
      throw err;
    }

    return {
      attempt,
      totalQuestions,
      durationMinutes,
      expiresAt,
    };
  }

  normalizeSettings(settings, mode) {
    const paging = this.parsePaging(settings.paging);
    const questionsPerPage = this.parsePositiveInt(settings.questionsPerPage, 5, "questionsPerPage");
    const questionTimeSeconds = this.parsePositiveInt(
      settings.questionTimeSeconds,
      30,
      "questionTimeSeconds"
    );

    let showAnswerAfterSelect = Boolean(settings.showAnswerAfterSelect);
    if (mode !== "practice") {
      showAnswerAfterSelect = false;
    }

    let shuffleQuestions = Boolean(settings.shuffleQuestions);
    if (mode !== "exam") {
      shuffleQuestions = false;
    }

    return {
      paging,
      questionsPerPage,
      questionTimeSeconds,
      showAnswerAfterSelect,
      shuffleQuestions,
    };
  }

  parsePaging(input) {
    if (!input) {
      return { from: 1, to: 50 };
    }

    if (typeof input === "string") {
      const match = input.match(/^(\d+)\s*-\s*(\d+)$/);
      if (!match) {
        throw new Error("Paging must be in format X-Y or object { from, to }.");
      }
      const from = Number(match[1]);
      const to = Number(match[2]);
      this.validatePaging(from, to);
      return { from, to };
    }

    if (typeof input === "object") {
      const from = Number(input.from);
      const to = Number(input.to);
      this.validatePaging(from, to);
      return { from, to };
    }

    throw new Error("Paging must be in format X-Y or object { from, to }.");
  }

  validatePaging(from, to) {
    if (!Number.isInteger(from) || !Number.isInteger(to)) {
      throw new Error("Paging values must be integers.");
    }
    if (from < 1 || to < 1) {
      throw new Error("Paging values must be greater than 0.");
    }
    if (from > to) {
      throw new Error("Paging start must be less than or equal to paging end.");
    }
  }

  parsePositiveInt(value, defaultValue, fieldName) {
    if (value === undefined || value === null || value === "") {
      return defaultValue;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new Error(`${fieldName} must be a positive integer.`);
    }

    return parsed;
  }

  async buildOptionOrder(questionId, mode) {
    const options = await this.optionRepository.findByQuestion(questionId);
    const optionIds = options.map((option) => option.id);

    if (mode === "exam") {
      return this.shuffleArray(optionIds);
    }

    return optionIds;
  }

  shuffleArray(items) {
    for (let i = items.length - 1; i > 0; i -= 1) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [items[i], items[randomIndex]] = [items[randomIndex], items[i]];
    }
    return items;
  }
}

module.exports = StartAttempt;
