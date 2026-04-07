const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = authMiddleware;

router.use(authMiddleware);

router.get('/', (req, res) => userController.getAll(req, res));

router.get('/me', (req, res) => userController.getMe(req, res));

router.post('/', (req, res) => userController.create(req, res));

router.put('/:id', (req, res) => userController.update(req, res));

router.delete('/:id', requireRole('admin', 'superadmin'), (req, res) => userController.delete(req, res));

module.exports = router;