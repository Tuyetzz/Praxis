// src/usecases/option/UpdateOption.js
const optionRepository = require('../../infrastructure/repositories/OptionRepository');
const questionRepository = require('../../infrastructure/repositories/QuestionRepository');

class UpdateOption {
  async execute(id, updateData) {
    const option = await optionRepository.findById(id);
    if (!option) throw new Error("Could not find option with the provided id.");

    if (Object.prototype.hasOwnProperty.call(updateData, 'questionId')) {
      if (!updateData.questionId) {
        throw new Error("Question ID cannot be empty.");
      }
      const question = await questionRepository.findById(updateData.questionId);
      if (!question) throw new Error("Question not found.");
    }

    if (Object.prototype.hasOwnProperty.call(updateData, 'text')) {
      if (typeof updateData.text !== 'string' || updateData.text.trim() === "") {
        throw new Error("Option text cannot be empty or whitespace.");
      }
    }

    const updatePayload = {
      ...updateData,
      text: typeof updateData.text === 'string' ? updateData.text.trim() : undefined
    };

    return await optionRepository.update(id, updatePayload);
  }
}

module.exports = new UpdateOption();
