const express = require('express');
const router = express.Router();
const container = require('../../container');
const aiController = container.resolve('aiController');
const authMiddleware = container.resolve('authMiddleware');
const aiRateLimiter = require('../middlewares/aiRateLimiter');
const { PERMISSIONS } = require('../../domain/constants/permissions');

const { requiredPermission } = authMiddleware;

// Generate quiz questions with AI. Any authenticated user may call this.
// Apply rate limiting to prevent spam and control API costs.
router.post('/generate-quiz', aiRateLimiter, requiredPermission(PERMISSIONS.AI_GENERATE_QUIZ), (req, res) =>
  aiController.generateQuizQuestions(req, res)
);

module.exports = router;
