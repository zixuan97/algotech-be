const router = require('express').Router();
const deliveryController = require('../controllers/deliveryController');

router.post('/', deliveryController.createDeliveryOrder);
router.get('/all', deliveryController.getAllDeliveryOrders);
router.get('/manual/all', deliveryController.getAllManualDeliveryOrders);
router.get('/grab/all', deliveryController.getAllGrabDeliveryOrders);
router.get('/shippit/all', deliveryController.getAllShippitDeliveryOrders);
router.get('/:id', deliveryController.getDeliveryOrder);
router.put('/', deliveryController.updateDeliveryOrder);
router.delete('/:id', deliveryController.deleteDeliveryOrder);
router.post('/shippit', deliveryController.sendDeliveryOrderToShippit);
router.get('/shippit/:trackingNum', deliveryController.trackShippitOrder);
router.get(
  '/shippit/latest/:trackingNum',
  deliveryController.getLastestTrackingInfoOfOrder
);
router.get('/shippit/orders/all', deliveryController.getAllShippitOrdersFromWebsite);
router.get('/shippit/auth/token', deliveryController.getToken);
router.post('/cancel/:trackingNumber', deliveryController.cancelShippitOrder);
router.post('/shippit/confirm/:trackingNumber', deliveryController.confirmShippitOrder);
router.get('/shippit/label/:trackingNumber', deliveryController.getShippitOrderLabel);
router.post('/shippit/book/:trackingNumber', deliveryController.bookShippitDelivery);
router.post('/latlong', deliveryController.getLatLong);
router.post('/timefilter/all', deliveryController.findDeliveriesWithTimeAndTypeFilter);
router.post('/pdf/:id', deliveryController.generateDO);
router.post('/deliveryAssignment/:id', deliveryController.getAllAssignedManualDeliveriesByUser);
router.post('/getCurrentLatLng', deliveryController.getCurrentLocationLatLong);
router.get('/unassigned/user', deliveryController.getAllUnassignedManualDeliveries);

module.exports = router;
