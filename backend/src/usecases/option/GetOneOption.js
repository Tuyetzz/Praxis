// src/usecases/option/GetOneOption.js
class GetOneOption {
  constructor({ optionRepository }) {
    this.optionRepository = optionRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Option id is required');
    const option = await this.optionRepository.findById(id);
    if (!option) throw new Error('Could not find option with the provided id');
    return option;
  }
}

module.exports = GetOneOption;
