const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));

router.use('/roles', require('./roleRoutes'));
router.use('/permissions', require('./permissionRoutes'));

module.exports = router;