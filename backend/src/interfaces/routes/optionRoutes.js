// src/interfaces/routes/optionRoutes.js
const express = require('express');
const router = express.Router();
const optionController = require('../controllers/OptionController');
const authMiddleware = require('../middlewares/authMiddleware');
const { PERMISSIONS } = require('../../domain/constants/permissions');

const { requiredPermission } = authMiddleware;

router.get('/', requiredPermission(PERMISSIONS.QUESTION_VIEW), (req, res) => 
  optionController.getAll(req, res)
);

router.get('/question/:questionId', requiredPermission(PERMISSIONS.QUESTION_VIEW), (req, res) => 
  optionController.getByQuestion(req, res)
);

router.get('/:id', requiredPermission(PERMISSIONS.QUESTION_VIEW), (req, res) => 
  optionController.getOne(req, res)
);

router.post('/', requiredPermission(PERMISSIONS.QUESTION_CREATE), (req, res) => 
  optionController.create(req, res)
);

router.put('/:id', requiredPermission(PERMISSIONS.QUESTION_UPDATE), (req, res) => 
  optionController.update(req, res)
);

router.delete('/:id', requiredPermission(PERMISSIONS.QUESTION_DELETE), (req, res) => 
  optionController.delete(req, res)
);

module.exports = router;
