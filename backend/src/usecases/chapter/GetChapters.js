// src/usecases/chapter/GetChapters.js
class GetChapters {
  constructor({ chapterRepository }) {
    this.chapterRepository = chapterRepository;
  }

  async execute(filters = {}) {
    const { includeDeleted, onlyDeleted, ...where } = filters || {};
    const includeDeletedFlag = includeDeleted === true || includeDeleted === 'true' || includeDeleted === '1';
    const onlyDeletedFlag = onlyDeleted === true || onlyDeleted === 'true' || onlyDeleted === '1';

    return await this.chapterRepository.findAll(where, {
      includeDeleted: includeDeletedFlag,
      onlyDeleted: onlyDeletedFlag
    });
  }
}

module.exports = GetChapters;
