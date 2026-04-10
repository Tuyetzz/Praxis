const express = require('express');
const router = express.Router();
const contextMiddleware = require('../middlewares/contextMiddleware');

router.use('/auth', require('./authRoutes'));

// Apply context middleware to protected routes (after auth routes)
router.use(contextMiddleware);

router.use('/users', require('./userRoutes'));
router.use('/roles', require('./roleRoutes'));
router.use('/permissions', require('./permissionRoutes'));

module.exports = router;