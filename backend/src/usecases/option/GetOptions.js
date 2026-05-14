// src/usecases/option/GetOptions.js
class GetOptions {
  constructor({ optionRepository }) {
    this.optionRepository = optionRepository;
  }

  async execute(filters = {}) {
    const { includeDeleted, onlyDeleted, ...where } = filters || {};
    const includeDeletedFlag = includeDeleted === true || includeDeleted === 'true' || includeDeleted === '1';
    const onlyDeletedFlag = onlyDeleted === true || onlyDeleted === 'true' || onlyDeleted === '1';

    return await this.optionRepository.findAll(where, {
      includeDeleted: includeDeletedFlag,
      onlyDeleted: onlyDeletedFlag
    });
  }
}

module.exports = GetOptions;
