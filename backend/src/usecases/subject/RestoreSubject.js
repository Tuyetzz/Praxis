// src/usecases/subject/RestoreSubject.js
class RestoreSubject {
  constructor({ subjectRepository }) {
    this.subjectRepository = subjectRepository;
  }

  async execute(id) {
    if (!id) {
      throw new Error("Subject ID is required.");
    }

    const subject = await this.subjectRepository.findByIdIncludingDeleted(id);
    if (!subject) {
      throw new Error("Subject not found with this ID.");
    }

    return await this.subjectRepository.restore(id);
  }
}

module.exports = RestoreSubject;
