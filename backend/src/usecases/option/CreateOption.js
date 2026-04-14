// src/usecases/option/CreateOption.js
const optionRepository = require('../../infrastructure/repositories/OptionRepository');
const questionRepository = require('../../infrastructure/repositories/QuestionRepository');
const Option = require('../../domain/entities/Option');

class CreateOption {
  async execute(optionData) {
    const { questionId, text, isCorrect, media, order } = optionData;

    // Validate question exists
    const question = await questionRepository.findById(questionId);
    if (!question) throw new Error("Question not found.");

    // Validate option has content
    if (!text || text.trim() === "") {
      throw new Error("Option text cannot be empty.");
    }

    // Create and validate option entity
    const option = new Option({
      questionId,
      text: text.trim(),
      isCorrect: isCorrect || false,
      media: media || null,
      order: order || 0
    });

    const result = await optionRepository.create(option);
    return result;
  }
}

module.exports = new CreateOption();
