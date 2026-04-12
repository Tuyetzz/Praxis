// src/interfaces/routes/permissionRoutes.js
const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/PermissionController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requiredPermission } = authMiddleware;
const { PERMISSIONS } = require('../../domain/constants/permissions');


router.get('/', requiredPermission(PERMISSIONS.PERMISSION_MANAGE), (req, res) => permissionController.getAll(req, res));

module.exports = router;
