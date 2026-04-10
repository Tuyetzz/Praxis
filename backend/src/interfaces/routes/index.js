const express = require('express');
const router = express.Router();
const contextMiddleware = require('../middlewares/contextMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

router.use('/auth', require('./authRoutes'));

router.use(authMiddleware);
router.use(contextMiddleware);

router.use('/users', require('./userRoutes'));
router.use('/roles', require('./roleRoutes'));
router.use('/permissions', require('./permissionRoutes'));

module.exports = router;