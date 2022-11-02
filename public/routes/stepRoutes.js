const router = require('express').Router();
const stepController = require('../controllers/stepController');

router.post('/', stepController.createStep);
router.get('/all/:topicId', stepController.getAllStepsByTopicId);
router.get('/:id', stepController.getStep);
router.put('/', stepController.updateStep);
router.delete('/:id', stepController.deleteStep);

module.exports = router;
