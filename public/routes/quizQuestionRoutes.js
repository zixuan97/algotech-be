const router = require('express').Router();
const quizQuestionController = require('../controllers/quizQuestionController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, quizQuestionController.createQuizQuestion);
// router.get('/all/:quizId', quizQuestionController.getAllQuizQuestionsByQuizId);
// router.get('/:id', quizQuestionController.getQuizQuestion);
router.put('/', verifyToken, quizQuestionController.updateQuizQuestion);
router.delete('/:id', verifyToken, quizQuestionController.deleteQuizQuestion);
router.post('/order', quizQuestionController.updateOrderBasedOnQuestionsArray);
router.post(
  '/record',
  verifyToken,
  quizQuestionController.createEmployeeQuizQuestionRecord
);
router.put(
  '/record',
  verifyToken,
  quizQuestionController.updateEmployeeQuizQuestionRecord
);
// router.get(
//   '/record/quiz',
//   quizQuestionController.getEmployeeQuizQuestionRecords
// );

module.exports = router;
