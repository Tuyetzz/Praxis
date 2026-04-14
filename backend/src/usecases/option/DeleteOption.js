// src/usecases/option/DeleteOption.js
const optionRepository = require('../../infrastructure/repositories/OptionRepository');

class DeleteOption {
  async execute(id) {
    return await optionRepository.softDelete(id);
  }
}

module.exports = new DeleteOption();
