const router = require('express').Router();
const subjectController = require('../controllers/subjectController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, subjectController.createSubject);
router.get('/all', subjectController.getAllSubjects);
router.get('/:id', subjectController.getSubject);
router.put('/', verifyToken, subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);
router.post('/users', subjectController.assignUsersToSubject);
router.post(
  '/topicquiz/:id',
  subjectController.getAllTopicsAndQuizzesBySubjectId
);
module.exports = router;
