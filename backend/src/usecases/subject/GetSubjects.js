// src/usecases/subject/GetSubjects.js
class GetSubjects {
  constructor({ subjectRepository }) {
    this.subjectRepository = subjectRepository;
  }

  async execute(filters = {}) {
    return await this.subjectRepository.findAll(filters);
  }
}

module.exports = GetSubjects;
