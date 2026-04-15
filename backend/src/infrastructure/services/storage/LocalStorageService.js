// src/infrastructure/services/storage/LocalStorageService.js
const fs = require('fs');
const path = require('path');
const StorageService = require('./StorageService');

class LocalStorageService extends StorageService {
  constructor() {
    super();
    this.uploadRoot = path.join(__dirname, '../../../../public/uploads');

    if (!fs.existsSync(this.uploadRoot)) {
      fs.mkdirSync(this.uploadRoot, { recursive: true });
    }
  }

  async save(file, folder = '') {
    const targetDir = path.join(this.uploadRoot, folder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    const filePath = path.join(targetDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return `/uploads/${folder ? folder + '/' : ''}${fileName}`;
  }

  async delete(fileUrl) {
    const relativePath = fileUrl.replace('/uploads/', '');
    const filePath = path.join(this.uploadRoot, relativePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = new LocalStorageService();