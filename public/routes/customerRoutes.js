const router = require('express').Router();
const CustomerController = require('../controllers/customerController');

router.post('/newsletter', CustomerController.createNewsletter);
router.get('/newsletter/:id' , CustomerController.getNewsletter);
router.get('/newsletter/all', CustomerController.getAllNewsletters);

module.exports = router;
