const router = require('express').Router();
const topicController = require('../controllers/topicController');

router.post('/', topicController.createTopic);
router.get('/all/:subjectId', topicController.getAllTopicsBySubjectId);
router.get('/:id', topicController.getTopic);
router.put('/', topicController.updateTopic);
router.post('/addsteps', topicController.addStepsToTopic);
router.delete('/:id', topicController.deleteTopic);

module.exports = router;
