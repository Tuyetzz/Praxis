const express = require('express');
const router = express.Router();
const container = require('../../container');
const typingResultController = container.resolve('typingResultController');
const authMiddleware = container.resolve('authMiddleware');
const { PERMISSIONS } = require('../../domain/constants/permissions');

const { requiredPermission } = authMiddleware;

router.get('/mine', requiredPermission(PERMISSIONS.TYPING_RESULT_VIEW), (req, res) =>
  typingResultController.getMine(req, res)
);

router.get('/text/:textId', requiredPermission(PERMISSIONS.TYPING_RESULT_VIEW), (req, res) =>
  typingResultController.getByText(req, res)
);

router.get('/text/:textId/leaderboard', requiredPermission(PERMISSIONS.TYPING_RESULT_VIEW), (req, res) =>
  typingResultController.getLeaderboard(req, res)
);

router.get('/:id', requiredPermission(PERMISSIONS.TYPING_RESULT_VIEW), (req, res) =>
  typingResultController.getOne(req, res)
);

router.delete('/:id/hard', requiredPermission(PERMISSIONS.TYPING_RESULT_DELETE), (req, res) =>
  typingResultController.hardDelete(req, res)
);

router.post('/', requiredPermission(PERMISSIONS.TYPING_RESULT_CREATE), (req, res) =>
  typingResultController.create(req, res)
);

module.exports = router;
