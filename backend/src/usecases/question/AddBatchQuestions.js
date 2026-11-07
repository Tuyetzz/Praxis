// src/usecases/question/AddBatchQuestions.js
const SequelizeUnitOfWork = require('../../infrastructure/unitOfWork/SequelizeUnitOfWork');
const Question = require('../../domain/entities/Question');
const Option = require('../../domain/entities/Option');

class AddBatchQuestions {
  constructor({ questionRepository, optionRepository, subjectRepository, chapterRepository }) {
    this.questionRepository = questionRepository;
    this.optionRepository = optionRepository;
    this.subjectRepository = subjectRepository;
    this.chapterRepository = chapterRepository;
  }
  async execute(batchData) {
    // Validate input structure
    if (!batchData || typeof batchData !== 'object') {
      throw new Error('Input must be an object with mode, subjectId, chapterId, type, and items');
    }


    const {
      mode = 'all-or-nothing',
      subjectId,
      chapterId,
      type: defaultType,
      items = []
    } = batchData;

    // Validate mode up-front
    const supportedModes = ['all-or-nothing', 'continue-on-error'];
    if (!supportedModes.includes(mode)) {
      throw new Error(`Invalid mode: ${mode}. Supported modes are 'all-or-nothing' and 'continue-on-error'.`);
    }

    if (!subjectId) throw new Error('subjectId is required');
    if (!chapterId) throw new Error('chapterId is required');
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('items must be a non-empty array');
    }

    // Validate subject and chapter exist
    const subject = await this.subjectRepository.findById(subjectId);
    if (!subject) throw new Error("Subject not found.");

    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) throw new Error("Chapter not found.");

    const chapterBelongsToSubject = await this.chapterRepository.existsBySubjectAndId(subjectId, chapterId);
    if (!chapterBelongsToSubject) {
      throw new Error("Chapter does not belong to the specified subject.");
    }

    const results = [];
    const errors = [];
    const uow = new SequelizeUnitOfWork();

    if (mode === 'all-or-nothing') {
      await uow.start();
    }


    try {
      for (let i = 0; i < items.length; i++) {
        try {
          const item = items[i];
          const {
            text,
            type = defaultType,
            explanation = null,
            difficulty = 1,
            points = 1,
            media = null,
            tags = [],
            options = []
          } = item;

          // Validate required fields
          if (!text || text.trim() === '') {
            throw new Error(`Item ${i + 1}: Question text cannot be empty`);
          }
          if (!type) {
            throw new Error(`Item ${i + 1}: Question type is required`);
          }

          // Create question entity
          const question = new Question({
            subjectId,
            chapterId,
            type,
            text: text.trim(),
            explanation,
            difficulty: parseInt(difficulty) || 1,
            points: parseInt(points) || 1,
            media: Array.isArray(media) ? media : (media ? [media] : []),
            tags: Array.isArray(tags) ? tags : []
          });

          // Create question in database
          const txOptions = mode === 'all-or-nothing' ? uow.getTx() : {};
          const createdQuestion = await this.questionRepository.create(question, null, txOptions);

          // Create options if provided
          const createdOptions = [];
          if (Array.isArray(options) && options.length > 0) {
            for (const optionData of options) {
              const {
                text: optionText,
                isCorrect = false,
                media: optionMedia = null,
                order = 0
              } = optionData;

              if (!optionText || optionText.trim() === '') {
                throw new Error(`Item ${i + 1}: Option text cannot be empty`);
              }

              const option = new Option({
                questionId: createdQuestion.id,
                text: optionText.trim(),
                isCorrect: !!isCorrect,
                media: optionMedia,
                order: parseInt(order) || 0
              });

              const createdOption = await this.optionRepository.create(option, null, txOptions);
              createdOptions.push(createdOption);
            }
          }

          results.push({
            question: createdQuestion,
            options: createdOptions
          });

        } catch (error) {
          if (mode === 'all-or-nothing') {
            throw new Error(`Batch creation failed at item ${i + 1}: ${error.message}`);
          } else if (mode === 'continue-on-error') {
            errors.push({
              index: i + 1,
              error: error.message
            });
          }
        }
      }
    } catch (error) {
      if (mode === 'all-or-nothing') {
        await uow.rollback();
      }
      throw error;
    }

    if (mode === 'all-or-nothing') {
      await uow.commit();
    }

    return {
      mode,
      created: results.length,
      errors: errors.length > 0 ? errors : undefined,
      data: results
    };
  }
}

module.exports = AddBatchQuestions;
