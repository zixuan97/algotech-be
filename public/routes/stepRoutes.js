const router = require('express').Router();
const stepController = require('../controllers/stepController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, stepController.createStep);
// router.get('/all/:topicId', stepController.getAllStepsByTopicId);
// router.get('/:id', stepController.getStep);
router.put('/', verifyToken, stepController.updateStep);
router.delete('/:id', verifyToken, stepController.deleteStep);
router.post('/order', stepController.updateOrderBasedOnStepsArray);

module.exports = router;
