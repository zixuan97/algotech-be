const router = require('express').Router();
const shopeeController = require('../controllers/shopeeController');

router.post('/', shopeeController.createKey);
router.get('/', shopeeController.refreshToken);
router.get('/orders', shopeeController.getAllOrders);
router.post('/download', shopeeController.downloadShippingDocument);
router.get('/tracking', shopeeController.getTrackingInfo);
module.exports = router;
