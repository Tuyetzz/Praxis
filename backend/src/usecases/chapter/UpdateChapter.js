// src/usecases/chapter/UpdateChapter.js
const chapterRepository = require('../../infrastructure/repositories/ChapterRepository');
const subjectRepository = require('../../infrastructure/repositories/SubjectRepository');

class UpdateChapter {
  async execute(id, updateData) {
    const chapter = await chapterRepository.findById(id);
    if (!chapter) {
      throw new Error("Chapter not found.");
    }

    if (updateData.name && updateData.name.trim().length < 2) {
      throw new Error("Chapter name must have at least 2 characters.");
    }

    if (updateData.order !== undefined && updateData.order < 0) {
      throw new Error("Chapter order cannot be a negative number.");
    }

    if (updateData.subjectId && updateData.subjectId !== chapter.subjectId) {
      const subject = await subjectRepository.findById(updateData.subjectId);
      if (!subject) {
        throw new Error("Subject not found.");
      }
    }

    const dataToUpdate = {};
    if (updateData.name) dataToUpdate.name = updateData.name.trim();
    if (updateData.order !== undefined) dataToUpdate.order = updateData.order;
    if (updateData.subjectId) dataToUpdate.subjectId = updateData.subjectId;

    return await chapterRepository.update(id, dataToUpdate);
  }
}

module.exports = new UpdateChapter();
