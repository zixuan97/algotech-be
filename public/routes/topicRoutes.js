const router = require('express').Router();
const topicController = require('../controllers/topicController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, topicController.createTopic);
router.get('/all/:subjectId', topicController.getAllTopicsBySubjectId);
router.get('/:id', topicController.getTopic);
router.put('/', verifyToken, topicController.updateTopic);
// router.post('/addsteps', verifyToken, topicController.addStepsToTopic);
router.delete('/:id', verifyToken, topicController.deleteTopic);
router.post('/order', topicController.updateOrderBasedOnTopicArray);
router.post(
  '/completed',
  verifyToken,
  topicController.markTopicAsCompletedByUser
);

module.exports = router;
