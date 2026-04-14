// src/usecases/option/GetOneOption.js
const optionRepository = require('../../infrastructure/repositories/OptionRepository');

class GetOneOption {
  async execute(id) {
    if (!id) throw new Error('Option id is required');
    const option = await optionRepository.findById(id);
    if (!option) throw new Error('Could not find option with the provided id');
    return option;
  }
}

module.exports = new GetOneOption();
