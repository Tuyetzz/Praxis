const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { requiredPermission, requiredRole } = authMiddleware;
const { PERMISSIONS } = require('../../domain/constants/permissions');


router.get('/', requiredPermission(PERMISSIONS.USER_VIEW), (req, res) => userController.getAll(req, res));

router.get('/me', (req, res) => userController.getMe(req, res));

router.post('/', requiredPermission(PERMISSIONS.USER_CREATE), (req, res) => userController.create(req, res));

router.put('/:id', requiredPermission(PERMISSIONS.USER_UPDATE), (req, res) => userController.update(req, res));

router.delete('/:id', requiredPermission(PERMISSIONS.USER_DELETE), (req, res) => userController.delete(req, res));

module.exports = router; 