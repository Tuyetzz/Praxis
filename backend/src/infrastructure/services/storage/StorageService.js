// src/infrastructure/services/storage/StorageService.js
class StorageService {
  async save(file, folder) {
    throw new Error("Method 'save()' must be implemented.");
  }

  async delete(fileUrl) {
    throw new Error("Method 'delete()' must be implemented.");
  }
}

module.exports = StorageService;