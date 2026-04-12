// src/usecases/subject/GetSubjects.js
const subjectRepository = require('../../infrastructure/repositories/SubjectRepository');

class GetSubjects {
  async execute(filters = {}) {
    return await subjectRepository.findAll(filters);
  }
}

module.exports = new GetSubjects();
