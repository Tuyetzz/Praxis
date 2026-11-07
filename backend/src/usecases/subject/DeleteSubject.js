// src/usecases/subject/DeleteSubject.js
class DeleteSubject {
  constructor({ subjectRepository }) {
    this.subjectRepository = subjectRepository;
  }

  async execute(id) {
    const subject = await this.subjectRepository.findById(id);
    if (!subject) {
      throw new Error("Subject not found with this ID.");
    }
    return await this.subjectRepository.softDelete(id);
  }
}

module.exports = DeleteSubject;
