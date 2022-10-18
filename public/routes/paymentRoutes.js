const router = require('express').Router();
const paymentController = require('../controllers/paymentController');

router.post('/', paymentController.payByStripeCreditCard);
router.post('/webhook', paymentController.stripeWebhook);

module.exports = router;
