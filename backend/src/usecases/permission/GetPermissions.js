// src/usecases/permission/GetPermissions.js
class GetPermissions {
  constructor({ permissionRepository }) {
    this.permissionRepository = permissionRepository;
  }

  async execute() {
    return await this.permissionRepository.findAll();
  }
}

module.exports = GetPermissions;
