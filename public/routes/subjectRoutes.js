const router = require('express').Router();
const subjectController = require('../controllers/subjectController');

router.post('/', subjectController.createSubject);
router.get('/all', subjectController.getAllSubjects);
router.get('/:id', subjectController.getSubject);
router.put('/', subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);
router.post('/users', subjectController.assignUsersToSubject);
router.post(
  '/topicquiz/:id',
  subjectController.getAllTopicsAndQuizzesBySubjectId
);
module.exports = router;