const router = require('express').Router();
const paymentController = require('../controllers/paymentController');

router.post('/', paymentController.payByStripeCreditCard);
router.post('/webhook', paymentController.stripeWebhook);
router.post('/link', paymentController.generatePaymentLink);
router.post('/remove', paymentController.removePaymentLink);

module.exports = router;
