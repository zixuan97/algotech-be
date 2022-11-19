const router = require('express').Router();
const subjectController = require('../controllers/subjectController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, subjectController.createSubject);
router.get('/all', subjectController.getAllSubjects);
router.get('/:id', subjectController.getSubject);
router.put('/', verifyToken, subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);
router.post('/users', verifyToken, subjectController.assignUsersToSubject);
router.post(
  '/unassign/users',
  verifyToken,
  subjectController.unassignUsersToSubject
);
// router.post(
//   '/topicquiz/:id',
//   subjectController.getAllTopicsAndQuizzesBySubjectId
// );
router.get(
  '/completionrate/:subjectId/:userId',
  subjectController.getSubjectRecordBySubjectByEmployee
);
router.get(
  '/records/all',
  verifyToken,
  subjectController.getSubjectRecordsOfUser
);
// router.post(
//   '/completionrate',
//   subjectController.updateCompletionRateBySubjectByEmployee
// );
// router.get('/all/subjects/:id', subjectController.getSubjectsAssignedByUserId);
// router.get('/all/users/:id', subjectController.getUsersAssignedBySubjectId);

module.exports = router;
