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

  sanitizeFolder(folder = '') {
    if (!folder) {
      return '';
    }
    const normalizedFolder = path.normalize(folder).replace(/^(\.\.(\/|\\|$))+/, '').replace(/^[/\\]+/, '');
    if (!normalizedFolder || normalizedFolder === '.' || path.isAbsolute(folder) || normalizedFolder.startsWith('..')) {
      throw new Error('Invalid upload folder');
    }
    const resolvedTargetDir = path.resolve(this.uploadRoot, normalizedFolder);
    const resolvedUploadRoot = path.resolve(this.uploadRoot);
    if (
      resolvedTargetDir !== resolvedUploadRoot &&
      !resolvedTargetDir.startsWith(resolvedUploadRoot + path.sep)
    ) {
      throw new Error('Invalid upload folder');
    }
    return normalizedFolder.split(path.sep).join('/');
  }
  async save(file, folder = '') {
    const safeFolder = this.sanitizeFolder(folder);
    const targetDir = path.join(this.uploadRoot, safeFolder);
    await fs.promises.mkdir(targetDir, { recursive: true });
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    const filePath = path.join(targetDir, fileName);
    await fs.promises.writeFile(filePath, file.buffer);
    return `/uploads/${safeFolder ? safeFolder + '/' : ''}${fileName}`;
  }

  async delete(fileUrl) {
    if (typeof fileUrl !== 'string' || !fileUrl.startsWith('/uploads/')) {
      return;
    }
    const relativePath = path.normalize(fileUrl.slice('/uploads/'.length));
    if (
      !relativePath ||
      path.isAbsolute(relativePath) ||
      relativePath === '..' ||
      relativePath.startsWith(`..${path.sep}`)
    ) {
      return;
    }
    const uploadRoot = path.resolve(this.uploadRoot);
    const filePath = path.resolve(uploadRoot, relativePath);
    if (path.relative(uploadRoot, filePath).startsWith('..')) {
      return;
    }
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      await fs.promises.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

module.exports = new LocalStorageService();