const router = require('express').Router();
const shopifyController = require('../controllers/shopifyController');

router.get('/orders', shopifyController.addShopifyOrders);
module.exports = router;
