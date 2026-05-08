// src/usecases/question/CreateQuestionWithOptions.js
const SequelizeUnitOfWork = require('../../infrastructure/unitOfWork/SequelizeUnitOfWork');
const Question = require('../../domain/entities/Question');
const Option = require('../../domain/entities/Option');

class CreateQuestionWithOptions {
  constructor({ questionRepository, optionRepository, subjectRepository, chapterRepository }) {
    this.questionRepository = questionRepository;
    this.optionRepository = optionRepository;
    this.subjectRepository = subjectRepository;
    this.chapterRepository = chapterRepository;
  }

  async execute(questionData) {
    const {
      subjectId,
      chapterId,
      type,
      text,
      explanation,
      difficulty,
      points,
      media,
      tags,
      options = []
    } = questionData;

    if (!subjectId) throw new Error('subjectId is required');
    if (!chapterId) throw new Error('chapterId is required');

    const subject = await this.subjectRepository.findById(subjectId);
    if (!subject) throw new Error('Subject not found.');

    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) throw new Error('Chapter not found.');

    const chapterBelongsToSubject = await this.chapterRepository.existsBySubjectAndId(subjectId, chapterId);
    if (!chapterBelongsToSubject) {
      throw new Error('Chapter does not belong to the specified subject.');
    }

    const question = new Question({
      subjectId,
      chapterId,
      type,
      text,
      explanation,
      difficulty: difficulty || 1,
      points: points || 1,
      media: media || [],
      tags: tags || []
    });

    const uow = new SequelizeUnitOfWork();
    await uow.start();

    try {
      const createdQuestion = await this.questionRepository.create(question, null, uow.getTx());
      const createdOptions = [];

      if (Array.isArray(options) && options.length > 0) {
        for (let i = 0; i < options.length; i++) {
          const optionData = options[i];
          const optionText = optionData?.text || "";

          if (!optionText || optionText.trim() === '') {
            throw new Error(`Option ${i + 1}: Option text cannot be empty`);
          }

          const option = new Option({
            questionId: createdQuestion.id,
            text: optionText.trim(),
            isCorrect: !!optionData?.isCorrect,
            media: optionData?.media || null,
            order: optionData?.order ?? i + 1
          });

          const createdOption = await this.optionRepository.create(option, null, uow.getTx());
          createdOptions.push(createdOption);
        }
      }

      await uow.commit();
      return { question: createdQuestion, options: createdOptions };
    } catch (error) {
      await uow.rollback();
      throw error;
    }
  }
}

module.exports = CreateQuestionWithOptions;
