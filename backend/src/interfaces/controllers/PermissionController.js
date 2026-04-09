// src/interfaces/controllers/PermissionController.js
const getPermissions = require('../../usecases/permission/GetPermissions');

class PermissionController {
  async getAll(req, res) {
    try {
      const result = await getPermissions.execute();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new PermissionController();
