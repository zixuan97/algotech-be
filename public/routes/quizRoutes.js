const router = require('express').Router();
const quizController = require('../controllers/quizController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, quizController.createQuiz);
router.get('/all/:subjectId', quizController.getAllQuizzesBySubjectId);
router.get('/:id', quizController.getQuiz);
router.put('/', verifyToken, quizController.updateQuiz);
router.post(
  '/addquestions',
  verifyToken,
  quizController.addQuizQuestionsToQuiz
);
router.delete('/:id', verifyToken, quizController.deleteQuiz);

module.exports = router;
