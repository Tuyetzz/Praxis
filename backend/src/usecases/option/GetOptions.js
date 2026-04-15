// src/usecases/option/GetOptions.js
class GetOptions {
  constructor({ optionRepository }) {
    this.optionRepository = optionRepository;
  }

  async execute(filters = {}) {
    return await this.optionRepository.findAll(filters);
  }
}

module.exports = GetOptions;
