const express = require('express');
const router = express.Router();
const container = require('../../container');
const healthController = container.resolve('healthController');

// Public by design - see the mount comment in routes/index.js.
router.get('/', (req, res) => healthController.check(req, res));

router.get('/live', (req, res) => healthController.live(req, res));

module.exports = router;
