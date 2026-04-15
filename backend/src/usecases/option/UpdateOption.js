// src/usecases/option/UpdateOption.js
class UpdateOption {
  constructor({ optionRepository, questionRepository }) {
    this.optionRepository = optionRepository;
    this.questionRepository = questionRepository;
  }

  async execute(id, updateData) {
    const option = await this.optionRepository.findById(id);
    if (!option) throw new Error("Could not find option with the provided id.");

    if (Object.prototype.hasOwnProperty.call(updateData, 'questionId')) {
      if (!updateData.questionId) {
        throw new Error("Question ID cannot be empty.");
      }
      const question = await this.questionRepository.findById(updateData.questionId);
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

    return await this.optionRepository.update(id, updatePayload);
  }
}

module.exports = UpdateOption;
