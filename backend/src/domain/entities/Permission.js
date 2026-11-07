// src/domain/entities/Permission.js

class Permission {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;

    this.validate();
  }

  validate() {
    if (!this.slug || !this.slug.includes(':')) {
      throw new Error("Permission slug must follow the format 'resource:action' (e.g., 'user:edit').");
    }
  }

  parseSlug() {
    const [resource, action] = this.slug.split(':');
    return { resource, action };
  }
}

module.exports = Permission;