// src/infrastructure/mappers/ImportQuestionMapper.js
const QUESTIONS_TYPE_ENUM = require("../../domain/constants/questions_type_enum");

class ImportQuestionMapper {
  /**
   * Detect file type (kahoot or quizizz) based on column headers
   * @param {Object} firstRow
   * @returns {string} 'kahoot' or 'quizizz'
   */
  detectFileType(firstRow) {
    const headers = Object.keys(firstRow).map(h => h.trim().toLowerCase());
    // Kahoot: ignore first column (index/number), check for 'question', 'answer 1', 'correct answer(s)'
    const kahootHeaders = headers.slice(1); // skip first column
    if (
      kahootHeaders.includes('question') &&
      kahootHeaders.some(h => h.startsWith('answer 1')) &&
      kahootHeaders.includes('correct answer(s)')
    ) {
      return 'kahoot';
    }
    // Quizizz has columns: "Question Text", "Question Type", "Option 1-5", "Correct Answer"
    if (headers.includes('question type')) {
      return 'quizizz';
    }
    throw new Error('Unknown file format. Expected Kahoot or Quizzes template.');
  }

  /**
   * Map Kahoot format to Question and Options
   * @param {Object} row - Single row from Kahoot file
   * @param {Object} params - { subjectId, chapterId }
   * @returns {Object} { question, options }
   */
  mapKahootRow(row, params) {
    const { subjectId, chapterId } = params;
    
    // Extract question text
    const questionText = row['Question']?.trim();
    if (!questionText) {
      return null;
    }

    // Extract answers (1-4)
    const answerTexts = [
      row['Answer 1']?.trim(),
      row['Answer 2']?.trim(),
      row['Answer 3']?.trim(),
      row['Answer 4']?.trim(),
    ].filter(a => a); // Remove empty

    // Extract correct answers (e.g., "1,2,3" or "1")
    const correctAnswerStr = row['Correct answer(s)']?.trim() || '';
    const correctAnswers = correctAnswerStr
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n >= 1 && n <= 4);

    if (answerTexts.length === 0 || correctAnswers.length === 0) {
      return null;
    }

    // Create Question object
    const question = {
      subjectId,
      chapterId,
      type: QUESTIONS_TYPE_ENUM.MULTIPLE,
      text: questionText,
      // Skip explanation, media, tags if empty
      ...(row['Explanation'] && { explanation: row['Explanation'].trim() }),
      ...(row['Difficulty'] && { difficulty: parseInt(row['Difficulty']) || 1 }),
      ...(row['Points'] && { points: parseInt(row['Points']) || 1 }),
    };

    // Create Options
    const options = answerTexts.map((text, index) => ({
      text,
      isCorrect: correctAnswers.includes(index + 1), // index is 0-based, answer is 1-based
      order: index,
      // media only if not empty
      ...(row[`Answer ${index + 1} Media`] && { media: row[`Answer ${index + 1} Media`].trim() }),
    }));

    return { question, options };
  }

  /**
   * Map Quizizz format to Question and Options
   * @param {Object} row - Single row from Quizizz file
   * @param {Object} params - { subjectId, chapterId }
   * @returns {Object} { question, options }
   */
  mapQuizizzRow(row, params) {
    const { subjectId, chapterId } = params;
    
    // Extract question text
    const questionText = row['Question Text']?.trim();
    if (!questionText) {
      return null;
    }

    // Extract question type (default to Multiple Choice)
    let questionType = QUESTIONS_TYPE_ENUM.MULTIPLE;
    let rawType = (row['Question Type'] ?? '').toString().trim().toLowerCase();
    if (rawType) {
      questionType = this.normalizeQuestionType(rawType);
    }
    // Only allow Multiple Choice and Checkbox
    if (!(rawType === 'multiple choice' || rawType === 'checkbox' || rawType === '')) {
      return null; // skip unsupported types
    }

    // Extract options (1-5)
    const optionTexts = [
      (row['Option 1'] ?? '').toString().trim(),
      (row['Option 2'] ?? '').toString().trim(),
      (row['Option 3'] ?? '').toString().trim(),
      (row['Option 4'] ?? '').toString().trim(),
      (row['Option 5'] ?? '').toString().trim(),
    ].filter(t => t);

    // Extract correct answer (single index)
    const correctAnswerStr = (row['Correct Answer'] ?? '').toString().trim();
    const correctAnswerIndex = parseInt(correctAnswerStr);

    if (optionTexts.length === 0) {
      return null;
    }

    // For non-MC types, correct answer might be empty
    const hasCorrectAnswer = !isNaN(correctAnswerIndex) && correctAnswerIndex >= 1 && correctAnswerIndex <= optionTexts.length;

    // Create Question object
    const question = {
      subjectId,
      chapterId,
      type: questionType,
      text: questionText,
      // Add optional fields only if not empty
      ...(row['Answer explanation'] && { explanation: row['Answer explanation'].trim() }),
      ...(row['Image Link'] && { media: { image: row['Image Link'].trim() } }),
      ...(row['Difficulty'] && { difficulty: parseInt(row['Difficulty']) || 1 }),
      ...(row['Points'] && { points: parseInt(row['Points']) || 1 }),
    };

    // Create Options
    const options = optionTexts.map((text, index) => ({
      text,
      isCorrect: hasCorrectAnswer && correctAnswerIndex === index + 1,
      order: index,
      // media only if not empty
      ...(row[`Option ${index + 1} Media`] && { media: row[`Option ${index + 1} Media`].trim() }),
    }));

    return { question, options };
  }

  /**
   * Normalize question type to match QUESTIONS_TYPE_ENUM
   * @param {string} typeStr
   * @returns {string}
   */
  normalizeQuestionType(typeStr) {
    if (!typeStr) {
      return QUESTIONS_TYPE_ENUM.MULTIPLE;
    }

    const normalized = typeStr.toLowerCase().replace(/\s+/g, '_');
    // Only map Multiple Choice and Checkbox
    if (normalized === 'multiple_choice' || normalized === 'multiplechoice' || normalized === 'multiple') {
      return QUESTIONS_TYPE_ENUM.MULTIPLE;
    }
    if (normalized === 'checkbox') {
      return QUESTIONS_TYPE_ENUM.MULTIPLE;
    }
    // All others: skip (should be filtered above)
    return QUESTIONS_TYPE_ENUM.MULTIPLE;
  }

  /**
   * Map parsed file data to questions and options
   * @param {Array<Object>} data - Parsed rows from file
   * @param {Object} params - { subjectId, chapterId, fileType? }
   * @returns {Array<Object>} Array of { question, options }
   */
  mapData(data, params) {
    if (!data || data.length === 0) {
      return [];
    }

    // Detect file type from first row
    let fileType = params.fileType;
    if (!fileType) {
      fileType = this.detectFileType(data[0]);
    }

    // Skip first row if it's headers/instructions
    const startIndex = fileType === 'kahoot' ? 8 : 1; // Quizizz row 1 is instructions
    const mapper = fileType === 'kahoot' ? this.mapKahootRow : this.mapQuizizzRow;

    const results = [];
    for (let i = startIndex; i < data.length; i++) {
      const row = data[i];
      const mapped = mapper.call(this, row, params);
      if (mapped) {
        results.push(mapped);
      }
    }

    return results;
  }
}

module.exports = new ImportQuestionMapper();
