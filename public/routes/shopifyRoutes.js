const router = require('express').Router();
const shopifyController = require('../controllers/shopifyController');

router.get('/orders', shopifyController.addShopifyOrders);
router.post('/', shopifyController.createOrderWebhook);
router.get('/webhook', shopifyController.sendOrderWebhook);
module.exports = router;
