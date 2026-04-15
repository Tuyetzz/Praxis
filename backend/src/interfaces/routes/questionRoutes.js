// src/interfaces/routes/questionRoutes.js

const express = require('express');
const router = express.Router();
const container = require('../../container');
const questionController = container.resolve('questionController');
const authMiddleware = container.resolve('authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { PERMISSIONS } = require('../../domain/constants/permissions');

const { requiredPermission } = authMiddleware;

router.get('/search', requiredPermission(PERMISSIONS.QUESTION_VIEW), (req, res) => 
  questionController.search(req, res)
);

router.get('/', requiredPermission(PERMISSIONS.QUESTION_VIEW), (req, res) => 
  questionController.getAll(req, res)
);

router.get('/subject/:subjectId', requiredPermission(PERMISSIONS.QUESTION_VIEW), (req, res) => 
  questionController.getBySubject(req, res)
);

router.get('/chapter/:chapterId', requiredPermission(PERMISSIONS.QUESTION_VIEW), (req, res) => 
  questionController.getByChapter(req, res)
);

router.get('/:id', requiredPermission(PERMISSIONS.QUESTION_VIEW), (req, res) => 
  questionController.getOne(req, res)
);


router.post('/batch', requiredPermission(PERMISSIONS.QUESTION_CREATE), (req, res) => 
  questionController.addBatch(req, res)
);

router.post('/import', requiredPermission(PERMISSIONS.QUESTION_CREATE), upload.single('file'), (req, res) => 
  questionController.importFromFile(req, res)
);

router.post('/', requiredPermission(PERMISSIONS.QUESTION_CREATE), (req, res) => 
  questionController.create(req, res)
);

router.put('/:id', requiredPermission(PERMISSIONS.QUESTION_UPDATE), (req, res) => 
  questionController.update(req, res)
);

router.delete('/:id', requiredPermission(PERMISSIONS.QUESTION_DELETE), (req, res) => 
  questionController.delete(req, res)
);

module.exports = router;
