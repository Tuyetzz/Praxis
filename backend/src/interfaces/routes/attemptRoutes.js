// src/interfaces/routes/attemptRoutes.js
const express = require("express");
const router = express.Router();
const container = require("../../container");
const attemptController = container.resolve("attemptController");
const authMiddleware = container.resolve("authMiddleware");
const { PERMISSIONS } = require("../../domain/constants/permissions");

const { requiredPermission } = authMiddleware;

router.get("/:id", requiredPermission(PERMISSIONS.ATTEMPT_VIEW), (req, res) =>
  attemptController.getOne(req, res)
);

router.get("/:attemptId/questions", requiredPermission(PERMISSIONS.ATTEMPT_VIEW), (req, res) =>
  attemptController.getQuestions(req, res)
);

router.get("/:attemptId/grade", requiredPermission(PERMISSIONS.ATTEMPT_VIEW), (req, res) =>
  attemptController.getGrade(req, res)
);

router.post("/:attemptId/answers", requiredPermission(PERMISSIONS.ATTEMPT_CREATE), (req, res) =>
  attemptController.saveAnswer(req, res)
);

router.post("/:attemptId/submit", requiredPermission(PERMISSIONS.ATTEMPT_SUBMIT), (req, res) =>
  attemptController.submitAttempt(req, res)
);

router.post("/start", requiredPermission(PERMISSIONS.ATTEMPT_CREATE), (req, res) =>
  attemptController.start(req, res)
);

module.exports = router;
