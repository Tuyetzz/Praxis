// src/usecases/subject/UpdateSubject.js
const subjectRepository = require('../../infrastructure/repositories/SubjectRepository');

class UpdateSubject {
  async execute(id, updateData) {
    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw new Error("Subject not found.");
    }

    // Validate name
    if (updateData.name && updateData.name.trim().length < 2) {
      throw new Error("Subject name must be at least 2 characters long.");
    }

    if (updateData.slug && !/^[a-z0-9-]+$/.test(updateData.slug)) {
      throw new Error("Slug is invalid (only lowercase letters, numbers, and hyphens are allowed).");
    }

    if (updateData.slug && updateData.slug !== subject.slug) {
      const existing = await subjectRepository.findBySlug(updateData.slug);
      if (existing) {
        throw new Error("Slug is already in use.");
      }
    }

    const dataToUpdate = {};
    if (updateData.name) dataToUpdate.name = updateData.name.trim();
    if (updateData.slug) dataToUpdate.slug = updateData.slug.toLowerCase();
    if (updateData.order !== undefined) dataToUpdate.order = updateData.order;

    return await subjectRepository.update(id, dataToUpdate);
  }
}

module.exports = new UpdateSubject();
