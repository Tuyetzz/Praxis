// src/interfaces/controllers/RoleController.js
const createRole = require('../../usecases/role/CreateRole');
const getRoles = require('../../usecases/role/GetRoles');
const getOneRole = require('../../usecases/role/GetOneRole');
const updateRole = require('../../usecases/role/UpdateRole');
const deleteRole = require('../../usecases/role/DeleteRole');
const assignPermissionToRole = require('../../usecases/role/AssignPermissionToRole');
const removePermissionFromRole = require('../../usecases/role/RemovePermissionFromRole');
const assignRoleToUser = require('../../usecases/role/AssignRoleToUser');
const removeRoleFromUser = require('../../usecases/role/RemoveRoleFromUser');
const getRolePermissions = require('../../usecases/role/GetRolePermissions');
const getUserRoles = require('../../usecases/role/GetUserRoles');

class RoleController {
  async create(req, res) {
    try {
      const result = await createRole.execute(req.body, req.user?.id);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await getRoles.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const result = await getOneRole.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await updateRole.execute(req.params.id, req.body, req.user?.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await deleteRole.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async assignPermission(req, res) {
    try {
      const { permissionId } = req.body;
      const result = await assignPermissionToRole.execute(req.params.id, permissionId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async removePermission(req, res) {
    try {
      const { permissionId } = req.body;
      const result = await removePermissionFromRole.execute(req.params.id, permissionId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getPermissions(req, res) {
    try {
      const result = await getRolePermissions.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async assignRoleToUser(req, res) {
    try {
      const { userId } = req.body;
      const result = await assignRoleToUser.execute(userId, req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async removeRoleFromUser(req, res) {
    try {
      const { userId } = req.body;
      const result = await removeRoleFromUser.execute(userId, req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getUserRoles(req, res) {
    try {
      const result = await getUserRoles.execute(req.params.userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new RoleController();
