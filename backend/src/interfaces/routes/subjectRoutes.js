// src/interfaces/routes/subjectRoutes.js
const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/SubjectController');
const { PERMISSIONS } = require('../../domain/constants/permissions');
const authMiddleware = require('../middlewares/authMiddleware');
const { requiredPermission } = authMiddleware;

router.get('/', requiredPermission(PERMISSIONS.SUBJECT_VIEW), (req, res) => 
  subjectController.getAll(req, res)
);

router.get('/:id', requiredPermission(PERMISSIONS.SUBJECT_VIEW), (req, res) => 
  subjectController.getOne(req, res)
);

router.post('/', requiredPermission(PERMISSIONS.SUBJECT_CREATE), (req, res) => 
  subjectController.create(req, res)
);

router.put('/:id', requiredPermission(PERMISSIONS.SUBJECT_UPDATE), (req, res) => 
  subjectController.update(req, res)
);

router.delete('/:id', requiredPermission(PERMISSIONS.SUBJECT_DELETE), (req, res) => 
  subjectController.delete(req, res)
);

module.exports = router;
