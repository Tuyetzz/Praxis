const express = require('express');
const router = express.Router();
const container = require('../../container');
const flashcardController = container.resolve('flashcardController');
const authMiddleware = container.resolve('authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { PERMISSIONS } = require('../../domain/constants/permissions');

const { requiredPermission } = authMiddleware;

// Static paths BEFORE /:id, otherwise "/import" would be read as an id.
router.post(
  '/import',
  requiredPermission(PERMISSIONS.FLASHCARD_CREATE),
  upload.single('file'),
  (req, res) => flashcardController.importFromFile(req, res)
);

router.get('/export/:deckId', requiredPermission(PERMISSIONS.FLASHCARD_VIEW), (req, res) =>
  flashcardController.export(req, res)
);

router.get('/deck/:deckId', requiredPermission(PERMISSIONS.FLASHCARD_VIEW), (req, res) =>
  flashcardController.getByDeck(req, res)
);

router.get('/:id', requiredPermission(PERMISSIONS.FLASHCARD_VIEW), (req, res) =>
  flashcardController.getOne(req, res)
);

router.post('/', requiredPermission(PERMISSIONS.FLASHCARD_CREATE), (req, res) =>
  flashcardController.create(req, res)
);

router.put('/:id', requiredPermission(PERMISSIONS.FLASHCARD_UPDATE), (req, res) =>
  flashcardController.update(req, res)
);

router.delete('/:id', requiredPermission(PERMISSIONS.FLASHCARD_DELETE), (req, res) =>
  flashcardController.delete(req, res)
);

module.exports = router;
