// src/usecases/option/RestoreOption.js
class RestoreOption {
  constructor({ optionRepository }) {
    this.optionRepository = optionRepository;
  }

  async execute(id) {
    if (!id) {
      throw new Error("Option ID is required.");
    }

    const option = await this.optionRepository.findByIdIncludingDeleted(id);
    if (!option) {
      throw new Error("Option not found.");
    }

    return await this.optionRepository.restore(id);
  }
}

module.exports = RestoreOption;
