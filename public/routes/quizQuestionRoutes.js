const router = require('express').Router();
const quizQuestionController = require('../controllers/quizQuestionController');

router.post('/', quizQuestionController.createQuizQuestion);
router.get('/all/:quizId', quizQuestionController.getAllQuizQuestionsByQuizId);
router.get('/:id', quizQuestionController.getQuizQuestion);
router.put('/', quizQuestionController.updateQuizQuestion);
router.delete('/:id', quizQuestionController.deleteQuizQuestion);

module.exports = router;
