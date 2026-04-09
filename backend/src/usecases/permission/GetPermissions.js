// src/usecases/permission/GetPermissions.js
const permissionRepository = require('../../infrastructure/repositories/PermissionRepository');

class GetPermissions {
  async execute() {
    return await permissionRepository.findAll();
  }
}

module.exports = new GetPermissions();
