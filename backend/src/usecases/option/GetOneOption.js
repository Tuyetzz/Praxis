// src/usecases/option/GetOneOption.js
const optionRepository = require('../../infrastructure/repositories/OptionRepository');

class GetOneOption {
  async execute(id) {
    if (!id) throw new Error('Option id is required');
    return await optionRepository.findById(id);
  }
}

module.exports = new GetOneOption();
