const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

router.post('/register', (req, res) => authController.register(req, res));

router.post('/login', (req, res) => authController.login(req, res));

router.post('/refresh', (req, res) => authController.refreshToken(req, res));

router.post('/logout', (req, res) => authController.logout(req, res));

module.exports = router;