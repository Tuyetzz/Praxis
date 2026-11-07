// src/interfaces/controllers/RoleController.js
class RoleController {
  constructor({
    createRole,
    getRoles,
    getOneRole,
    updateRole,
    deleteRole,
    restoreRole,
    assignPermissionToRole,
    removePermissionFromRole,
    assignRoleToUser,
    removeRoleFromUser,
    getRolePermissions,
    getUserRoles
  }) {
    this.createRole = createRole;
    this.getRoles = getRoles;
    this.getOneRole = getOneRole;
    this.updateRole = updateRole;
    this.deleteRole = deleteRole;
    this.restoreRole = restoreRole;
    this.assignPermissionToRole = assignPermissionToRole;
    this.removePermissionFromRole = removePermissionFromRole;
    this.assignRoleToUserUseCase = assignRoleToUser;
    this.removeRoleFromUserUseCase = removeRoleFromUser;
    this.getRolePermissions = getRolePermissions;
    this.getUserRoles = getUserRoles;
  }
  async create(req, res) {
    try {
      const result = await this.createRole.execute(req.body, req.user?.id);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await this.getRoles.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const result = await this.getOneRole.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await this.updateRole.execute(req.params.id, req.body, req.user?.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await this.deleteRole.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async restore(req, res) {
    try {
      const result = await this.restoreRole.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async assignPermission(req, res) {
    try {
      const { permissionId } = req.body;
      const result = await this.assignPermissionToRole.execute(req.params.id, permissionId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async removePermission(req, res) {
    try {
      const { permissionId } = req.body;
      const result = await this.removePermissionFromRole.execute(req.params.id, permissionId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getPermissions(req, res) {
    try {
      const result = await this.getRolePermissions.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async assignRoleToUser(req, res) {
    try {
      const { userId } = req.body;
      const result = await this.assignRoleToUserUseCase.execute(userId, req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async removeRoleFromUser(req, res) {
    try {
      const { userId } = req.body;
      const result = await this.removeRoleFromUserUseCase.execute(userId, req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getUserRoles(req, res) {
    try {
      const result = await this.getUserRoles.execute(req.params.userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = RoleController;
