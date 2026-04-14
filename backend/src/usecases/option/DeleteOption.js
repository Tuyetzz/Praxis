// src/usecases/option/DeleteOption.js
const optionRepository = require('../../infrastructure/repositories/OptionRepository');

class DeleteOption {
  async execute(id) {
    if (!id) throw new Error("Option ID is required for deletion.");

    const option = await optionRepository.findById(id);
    if (!option) throw new Error("Could not find option with the provided id.");
    return await optionRepository.softDelete(id);
  }
}

module.exports = new DeleteOption();
