// src/usecases/option/DeleteOption.js
class DeleteOption {
  constructor({ optionRepository }) {
    this.optionRepository = optionRepository;
  }

  async execute(id) {
    if (!id) throw new Error("Option ID is required for deletion.");

    const option = await this.optionRepository.findById(id);
    if (!option) throw new Error("Could not find option with the provided id.");
    return await this.optionRepository.softDelete(id);
  }
}

module.exports = DeleteOption;
