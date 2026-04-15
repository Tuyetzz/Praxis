// src/usecases/question/ImportQuestionsFromFile.js
const ImportQuestionMapper = require('../../infrastructure/mappers/ImportQuestionMapper');
const ExcelParser = require('../../infrastructure/services/parser/ExcelParser');
const CsvParser = require('../../infrastructure/services/parser/CsvParser');
const Question = require('../../domain/entities/Question');
const Option = require('../../domain/entities/Option');

class ImportQuestionsFromFile {
  constructor({ questionRepository, optionRepository, subjectRepository, chapterRepository }) {
    this.questionRepository = questionRepository;
    this.optionRepository = optionRepository;
    this.subjectRepository = subjectRepository;
    this.chapterRepository = chapterRepository;
  }

  /**
   * Parse file based on extension
   * @param {Buffer} fileBuffer
   * @param {string} fileName
   * @returns {Promise<Array>}
   */
  async parseFile(fileBuffer, fileName) {
    const ext = fileName.split('.').pop().toLowerCase();

    switch (ext) {
      case 'xlsx':
      case 'xls':
        return await ExcelParser.parse(fileBuffer);
      case 'csv':
        return await CsvParser.parse(fileBuffer);
      case 'json':
        if (typeof fileBuffer === 'string') {
          return JSON.parse(fileBuffer);
        } else {
          return JSON.parse(fileBuffer.toString('utf8'));
        }
      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  /**
   * Validate import data
   * @param {Array} mappedData
   * @throws {AppError}
   */
  validateImportData(mappedData) {
    if (!mappedData || mappedData.length === 0) {
      throw new Error('No valid questions found in file');
    }

    // Validate each question
    mappedData.forEach((item, index) => {
      const { question, options } = item;

      if (!question.text) {
        throw new Error(`Row ${index + 1}: Question text is required`);
      }

      if (!Array.isArray(options) || options.length === 0) {
        throw new Error(`Row ${index + 1}: At least one option is required`);
      }

      // At least one option must be correct
      const hasCorrect = options.some(opt => opt.isCorrect);
      if (!hasCorrect) {
        throw new Error(`Row ${index + 1}: At least one correct option must be marked`);
      }

      options.forEach((opt, optIndex) => {
        if (!opt.text) {
          throw new Error(`Row ${index + 1}, Option ${optIndex + 1}: Option text is required`);
        }
      });
    });
  }

  /**
   * Execute import
   * @param {Object} params - { file, fileName, subjectId, chapterId, fileType? }
   * @returns {Promise<Object>} { totalQuestions, importedQuestions, errors }
   */
  async execute(params) {
    const { file, fileName, subjectId, chapterId, fileType } = params;

    if (!file) {
      throw new Error('File is required');
    }

    if (!subjectId || !chapterId) {
      throw new Error('Subject ID and Chapter ID are required');
    }

    // Validate subject and chapter exist
    const subject = await this.subjectRepository.findById(subjectId);
    if (!subject) throw new Error('Subject not found');

    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) throw new Error('Chapter not found');

    const chapterBelongsToSubject = await this.chapterRepository.existsBySubjectAndId(subjectId, chapterId);
    if (!chapterBelongsToSubject) {
      throw new Error('Chapter does not belong to the specified subject');
    }

    // Parse file
    const parsedData = await this.parseFile(file, fileName);

    // Map data to Question and Option format
    const mappedData = ImportQuestionMapper.mapData(parsedData, {
      subjectId,
      chapterId,
      fileType,
    });

    // Validate
    this.validateImportData(mappedData);

    // Create questions and options in database
    const importedQuestions = [];
    const errors = [];

    for (let i = 0; i < mappedData.length; i++) {
      try {
        const { question: questionData, options: optionsData } = mappedData[i];

        // Create question entity and save
        const question = new Question(questionData);
        const createdQuestion = await this.questionRepository.create(question);

        // Create options with questionId
        const createdOptions = [];
        for (const optionData of optionsData) {
          const option = new Option({
            questionId: createdQuestion.id,
            ...optionData,
          });
          const createdOption = await this.optionRepository.create(option);
          createdOptions.push(createdOption);
        }

        importedQuestions.push({
          id: createdQuestion.id,
          text: createdQuestion.text,
          optionsCount: createdOptions.length,
        });
      } catch (error) {
        errors.push({
          row: i + 1,
          error: error.message,
        });
      }
    }

    return {
      totalQuestions: mappedData.length,
      importedQuestions: importedQuestions.length,
      failedQuestions: errors.length,
      details: importedQuestions,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

module.exports = ImportQuestionsFromFile;
