// src/interfaces/routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/RoleController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requiredPermission } = authMiddleware;
const { PERMISSIONS } = require('../../domain/constants/permissions');

router.use(authMiddleware);

// Role CRUD operations
router.get('/', requiredPermission(PERMISSIONS.ROLE_MANAGE), (req, res) => roleController.getAll(req, res));

router.post('/', requiredPermission(PERMISSIONS.ROLE_MANAGE), (req, res) => roleController.create(req, res));

router.get('/:id', requiredPermission(PERMISSIONS.ROLE_MANAGE), (req, res) => roleController.getOne(req, res));

router.put('/:id', requiredPermission(PERMISSIONS.ROLE_MANAGE), (req, res) => roleController.update(req, res));

router.delete('/:id', requiredPermission(PERMISSIONS.ROLE_MANAGE), (req, res) => roleController.delete(req, res));

// Role Permissions management
router.get('/:id/permissions', requiredPermission(PERMISSIONS.ROLE_MANAGE), (req, res) => roleController.getPermissions(req, res));

router.post('/:id/permissions', requiredPermission(PERMISSIONS.PERMISSION_MANAGE), (req, res) => roleController.assignPermission(req, res));

router.delete('/:id/permissions', requiredPermission(PERMISSIONS.PERMISSION_MANAGE), (req, res) => roleController.removePermission(req, res));

// User-Role assignment
router.post('/:id/users', requiredPermission(PERMISSIONS.ROLE_MANAGE), (req, res) => roleController.assignRoleToUser(req, res));

router.delete('/:id/users', requiredPermission(PERMISSIONS.ROLE_MANAGE), (req, res) => roleController.removeRoleFromUser(req, res));

// Get user's roles
router.get('/users/:userId/roles', requiredPermission(PERMISSIONS.ROLE_MANAGE), (req, res) => roleController.getUserRoles(req, res));

module.exports = router;
