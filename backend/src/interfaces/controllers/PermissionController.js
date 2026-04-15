// src/interfaces/controllers/PermissionController.js
class PermissionController {
  constructor({ getPermissions }) {
    this.getPermissions = getPermissions;
  }
  async getAll(req, res) {
    try {
      const result = await this.getPermissions.execute();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = PermissionController;
