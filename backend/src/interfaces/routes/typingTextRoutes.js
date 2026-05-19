const express = require('express');
const router = express.Router();
const container = require('../../container');
const typingTextController = container.resolve('typingTextController');
const authMiddleware = container.resolve('authMiddleware');
const { PERMISSIONS } = require('../../domain/constants/permissions');

const { requiredPermission } = authMiddleware;

router.get('/mine', requiredPermission(PERMISSIONS.TYPING_TEXT_VIEW), (req, res) =>
  typingTextController.getMine(req, res)
);

router.get('/public', requiredPermission(PERMISSIONS.TYPING_TEXT_VIEW), (req, res) =>
  typingTextController.getPublic(req, res)
);

router.post('/summarize', requiredPermission(PERMISSIONS.TYPING_TEXT_VIEW), (req, res) =>
  typingTextController.summarize(req, res)
);

router.get('/', requiredPermission(PERMISSIONS.TYPING_TEXT_VIEW), (req, res) =>
  typingTextController.getAll(req, res)
);

router.get('/:id', requiredPermission(PERMISSIONS.TYPING_TEXT_VIEW), (req, res) =>
  typingTextController.getOne(req, res)
);

router.post('/', requiredPermission(PERMISSIONS.TYPING_TEXT_CREATE), (req, res) =>
  typingTextController.create(req, res)
);

router.put('/:id', requiredPermission(PERMISSIONS.TYPING_TEXT_UPDATE), (req, res) =>
  typingTextController.update(req, res)
);

router.patch('/:id/restore', requiredPermission(PERMISSIONS.TYPING_TEXT_UPDATE), (req, res) =>
  typingTextController.restore(req, res)
);

router.delete('/:id/hard', requiredPermission(PERMISSIONS.TYPING_TEXT_DELETE), (req, res) =>
  typingTextController.hardDelete(req, res)
);

router.delete('/:id', requiredPermission(PERMISSIONS.TYPING_TEXT_DELETE), (req, res) =>
  typingTextController.delete(req, res)
);

module.exports = router;
