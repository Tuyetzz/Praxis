// src/usecases/option/UpdateOption.js
const optionRepository = require('../../infrastructure/repositories/OptionRepository');
const questionRepository = require('../../infrastructure/repositories/QuestionRepository');
const Option = require('../../domain/entities/Option');

class UpdateOption {
  async execute(id, updateData) {
    const option = await optionRepository.findById(id);
    if (!option) throw new Error("Could not find option with the provided id.");

    // Validate question if provided
    if (updateData.questionId) {
      const question = await questionRepository.findById(updateData.questionId);
      if (!question) throw new Error("Question not found.");
    }

    // Validate text if provided
    if (updateData.text && updateData.text.trim() === "") {
      throw new Error("Option text cannot be empty.");
    }

    const updatePayload = {
      ...updateData,
      text: updateData.text ? updateData.text.trim() : undefined
    };

    return await optionRepository.update(id, updatePayload);
  }
}

module.exports = new UpdateOption();
