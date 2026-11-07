// src/usecases/subject/CreateSubject.js
class CreateSubject {
  constructor({ subjectRepository }) {
    this.subjectRepository = subjectRepository;
  }

  async execute(subjectData) {
    const { name, slug, order } = subjectData;

    if (!name || name.trim().length < 2) {
      throw new Error("Subject name must be at least 2 characters long.");
    }

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      throw new Error("Slug is invalid (only lowercase letters, numbers, and hyphens are allowed).");
    }

    const existing = await this.subjectRepository.findBySlug(slug);
    if (existing) {
      throw new Error("Slug is already in use.");
    }

    const newSubject = await this.subjectRepository.create({
      name: name.trim(),
      slug: slug.toLowerCase(),
      order: order || 0
    });

    return {
      id: newSubject.id,
      name: newSubject.name,
      slug: newSubject.slug,
      order: newSubject.order,
      createdAt: newSubject.createdAt
    };
  }
}

module.exports = CreateSubject;
