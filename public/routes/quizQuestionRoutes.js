const router = require('express').Router();
const quizQuestionController = require('../controllers/quizQuestionController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, quizQuestionController.createQuizQuestion);
router.get('/all/:quizId', quizQuestionController.getAllQuizQuestionsByQuizId);
router.get('/:id', quizQuestionController.getQuizQuestion);
router.put('/', verifyToken, quizQuestionController.updateQuizQuestion);
router.delete('/:id', verifyToken, quizQuestionController.deleteQuizQuestion);

module.exports = router;
