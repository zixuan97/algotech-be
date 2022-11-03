const router = require('express').Router();
const quizController = require('../controllers/quizController');

router.post('/', quizController.createQuiz);
router.get('/all/:subjectId', quizController.getAllQuizzesBySubjectId);
router.get('/:id', quizController.getQuiz);
router.put('/', quizController.updateQuiz);
router.post('/addquestions', quizController.addQuizQuestionsToQuiz);
router.delete('/:id', quizController.deleteQuiz);

module.exports = router;
