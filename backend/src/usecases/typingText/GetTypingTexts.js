class GetTypingTexts {
  constructor({ typingTextRepository }) {
    this.typingTextRepository = typingTextRepository;
  }

  async execute(filters = {}) {
    const { includeDeleted, onlyDeleted, ...where } = filters || {};
    const includeDeletedFlag = includeDeleted === true || includeDeleted === 'true' || includeDeleted === '1';
    const onlyDeletedFlag = onlyDeleted === true || onlyDeleted === 'true' || onlyDeleted === '1';

    return this.typingTextRepository.findAll(where, {
      includeDeleted: includeDeletedFlag,
      onlyDeleted: onlyDeletedFlag
    });
  }
}

module.exports = GetTypingTexts;
