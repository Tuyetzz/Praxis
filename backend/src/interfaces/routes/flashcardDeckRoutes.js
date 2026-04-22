const express = require('express');
const router = express.Router();
const container = require('../../container');
const flashcardDeckController = container.resolve('flashcardDeckController');
const authMiddleware = container.resolve('authMiddleware');
const { PERMISSIONS } = require('../../domain/constants/permissions');

const { requiredPermission } = authMiddleware;

router.get('/mine', requiredPermission(PERMISSIONS.FLASHCARD_DECK_VIEW), (req, res) =>
  flashcardDeckController.getMine(req, res)
);

router.get('/public', requiredPermission(PERMISSIONS.FLASHCARD_DECK_VIEW), (req, res) =>
  flashcardDeckController.getPublic(req, res)
);

router.get('/:id', requiredPermission(PERMISSIONS.FLASHCARD_DECK_VIEW), (req, res) =>
  flashcardDeckController.getOne(req, res)
);

router.post('/', requiredPermission(PERMISSIONS.FLASHCARD_DECK_CREATE), (req, res) =>
  flashcardDeckController.create(req, res)
);

router.put('/:id', requiredPermission(PERMISSIONS.FLASHCARD_DECK_UPDATE), (req, res) =>
  flashcardDeckController.update(req, res)
);

router.delete('/:id', requiredPermission(PERMISSIONS.FLASHCARD_DECK_DELETE), (req, res) =>
  flashcardDeckController.delete(req, res)
);

module.exports = router;
