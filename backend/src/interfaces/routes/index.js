const express = require('express');
const router = express.Router();
const contextMiddleware = require('../middlewares/contextMiddleware');
const container = require('../../container');
const authMiddleware = container.resolve('authMiddleware');

router.use('/auth', require('./authRoutes'));

router.use(authMiddleware);
router.use(contextMiddleware);

router.use('/users', require('./userRoutes'));
router.use('/roles', require('./roleRoutes'));
router.use('/permissions', require('./permissionRoutes'));
router.use('/subjects', require('./subjectRoutes'));
router.use('/chapters', require('./chapterRoutes'));
router.use('/questions', require('./questionRoutes'));
router.use('/options', require('./optionRoutes'));
router.use('/attempts', require('./attemptRoutes'));
router.use('/flashcard-decks', require('./flashcardDeckRoutes'));
router.use('/flashcards', require('./flashcardRoutes'));
router.use('/typing-texts', require('./typingTextRoutes'));
router.use('/typing-results', require('./typingResultRoutes'));

module.exports = router;