// src/usecases/subject/GetOneSubject.js
class GetOneSubject {
  constructor({ subjectRepository }) {
    this.subjectRepository = subjectRepository;
  }

  async execute(id) {
    const subject = await this.subjectRepository.findById(id);
    if (!subject) {
      throw new Error("Subject not found with this ID.");
    }
    return subject;
  }
}

module.exports = GetOneSubject;
