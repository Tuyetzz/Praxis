// src/usecases/subject/GetOneSubject.js
const subjectRepository = require('../../infrastructure/repositories/SubjectRepository');

class GetOneSubject {
  async execute(id) {
    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw new Error("Subject not found with this ID.");
    }
    return subject;
  }
}

module.exports = new GetOneSubject();
