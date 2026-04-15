
// src/interfaces/routes/permissionRoutes.js
const express = require('express');
const router = express.Router();
const container = require('../../container');
const permissionController = container.resolve('permissionController');
const authMiddleware = container.resolve('authMiddleware');
const { requiredPermission } = authMiddleware;
const { PERMISSIONS } = require('../../domain/constants/permissions');

router.get('/', requiredPermission(PERMISSIONS.PERMISSION_MANAGE), (req, res) => permissionController.getAll(req, res));

module.exports = router;
