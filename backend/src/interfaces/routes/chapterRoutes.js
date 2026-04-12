// src/interfaces/routes/chapterRoutes.js
const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/ChapterController');
const authMiddleware = require('../middlewares/authMiddleware');
const { PERMISSIONS } = require('../../domain/constants/permissions');

const { requiredPermission } = authMiddleware;

router.get('/', requiredPermission(PERMISSIONS.CHAPTER_VIEW), (req, res) => 
  chapterController.getAll(req, res)
);

router.get('/subject/:subjectId', requiredPermission(PERMISSIONS.CHAPTER_VIEW), (req, res) => 
  chapterController.getBySubject(req, res)
);

router.get('/:id', requiredPermission(PERMISSIONS.CHAPTER_VIEW), (req, res) => 
  chapterController.getOne(req, res)
);

router.post('/', requiredPermission(PERMISSIONS.CHAPTER_CREATE), (req, res) => 
  chapterController.create(req, res)
);

router.put('/:id', requiredPermission(PERMISSIONS.CHAPTER_UPDATE), (req, res) => 
  chapterController.update(req, res)
);

router.delete('/:id', requiredPermission(PERMISSIONS.CHAPTER_DELETE), (req, res) => 
  chapterController.delete(req, res)
);

module.exports = router;
