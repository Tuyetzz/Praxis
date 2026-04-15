// src/usecases/chapter/CreateChapter.js
class CreateChapter {
  constructor({ chapterRepository, subjectRepository }) {
    this.chapterRepository = chapterRepository;
    this.subjectRepository = subjectRepository;
  }

  async execute(chapterData) {
    const { subjectId, name, order } = chapterData;

    if (!subjectId) {
      throw new Error("Please provide the ID of the subject.");
    }

    const subject = await this.subjectRepository.findById(subjectId);
    if (!subject) {
      throw new Error("Subject not found.");
    }

    if (!name || name.trim().length < 2) {
      throw new Error("Chapter name must have at least 2 characters.");
    }

    if (order !== undefined && order < 0) {
      throw new Error("Chapter order cannot be a negative number.");
    }

    const newChapter = await this.chapterRepository.create({
      subjectId,
      name: name.trim(),
      order: order || 0
    });

    return {
      id: newChapter.id,
      subjectId: newChapter.subjectId,
      name: newChapter.name,
      order: newChapter.order,
      createdAt: newChapter.createdAt
    };
  }
}

module.exports = CreateChapter;
