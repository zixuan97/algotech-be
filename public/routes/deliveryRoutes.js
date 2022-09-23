const router = require('express').Router();
const deliveryController = require('../controllers/deliveryController');

router.post('/', deliveryController.createDeliveryOrder);
router.get('/all', deliveryController.getAllDeliveryOrders);
router.get('/:id', deliveryController.getDeliveryOrder);
router.put('/', deliveryController.updateDeliveryOrder);
router.delete('/:id', deliveryController.deleteDeliveryOrder);
router.post('/shippit', deliveryController.sendDeliveryOrderToShippit);
router.get('/shippit/:trackingNum', deliveryController.trackShippitOrder);
router.get('/shippit/latest/:trackingNum', deliveryController.getLastestTrackingInfoOfOrder);
router.get('/shippit/orders/all', deliveryController.getAllShippitOrders);
router.get('/shippit/auth/token', deliveryController.getToken);

module.exports = router;
