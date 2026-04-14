// src/usecases/option/GetOptions.js
const optionRepository = require('../../infrastructure/repositories/OptionRepository');

class GetOptions {
  async execute(filters = {}) {
    return await optionRepository.findAll(filters);
  }
}

module.exports = new GetOptions();
