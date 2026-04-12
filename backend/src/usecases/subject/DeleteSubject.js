// src/usecases/subject/DeleteSubject.js
const subjectRepository = require('../../infrastructure/repositories/SubjectRepository');

class DeleteSubject {
  async execute(id) {
    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw new Error("Subject not found with this ID.");
    }
    return await subjectRepository.softDelete(id);
  }
}

module.exports = new DeleteSubject();
