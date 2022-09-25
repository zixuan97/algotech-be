const router = require('express').Router();
const shopifyController = require('../controllers/shopifyController');

router.get('/orders', shopifyController.addShopifyOrders);
router.post('/', shopifyController.createOrderWebhook);
module.exports = router;
