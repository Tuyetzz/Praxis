// src/usecases/subject/GetSubjects.js
class GetSubjects {
  constructor({ subjectRepository }) {
    this.subjectRepository = subjectRepository;
  }

  async execute(filters = {}) {
    const { includeDeleted, onlyDeleted, ...where } = filters || {};
    const includeDeletedFlag = includeDeleted === true || includeDeleted === 'true' || includeDeleted === '1';
    const onlyDeletedFlag = onlyDeleted === true || onlyDeleted === 'true' || onlyDeleted === '1';

    return await this.subjectRepository.findAll(where, {
      includeDeleted: includeDeletedFlag,
      onlyDeleted: onlyDeletedFlag
    });
  }
}

module.exports = GetSubjects;
