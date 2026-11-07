const express = require('express');
const router = express.Router();
const container = require('../../container');
const flashcardController = container.resolve('flashcardController');
const authMiddleware = container.resolve('authMiddleware');
const { PERMISSIONS } = require('../../domain/constants/permissions');

const { requiredPermission } = authMiddleware;

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
