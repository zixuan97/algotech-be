const router = require('express').Router();
const deliveryController = require('../controllers/deliveryController');

router.post('/manual', deliveryController.createManualDeliveryOrder);
router.post('/shippit', deliveryController.createShippitDeliveryOrder);
router.post('/lalamove', deliveryController.createLalamoveDeliveryOrder);
router.get('/all', deliveryController.getAllDeliveryOrders);
router.get('/manual/all', deliveryController.getAllManualDeliveryOrders);
router.get('/lalamove/all', deliveryController.getAllLalamoveDeliveryOrders);
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
router.get(
  '/shippit/orders/all',
  deliveryController.getAllShippitOrdersFromWebsite
);
router.get('/shippit/auth/token', deliveryController.getToken);
router.post('/cancelManual/:id', deliveryController.cancelManualDeliveryOrder);
router.post('/cancel/:trackingNumber', deliveryController.cancelShippitOrder);
router.post(
  '/shippit/confirm/:trackingNumber',
  deliveryController.confirmShippitOrder
);
router.get(
  '/shippit/label/:trackingNumber',
  deliveryController.getShippitOrderLabel
);
router.post(
  '/shippit/book/:trackingNumber',
  deliveryController.bookShippitDelivery
);
router.post('/latlong', deliveryController.getLatLong);
router.post(
  '/latlong/unassigned',
  deliveryController.getLatLongForUnassignedOrders
);
router.post(
  '/latlong/assigned',
  deliveryController.getLatLongForAssignedOrders
);
router.post(
  '/timefilter/all',
  deliveryController.findDeliveriesWithTimeAndTypeFilter
);
router.post('/pdf/:id', deliveryController.generateDO);
router.post(
  '/deliveryAssignment/:id',
  deliveryController.getAllAssignedManualDeliveriesByUser
);
router.post('/getCurrentLatLng', deliveryController.getCurrentLocationLatLong);
router.get(
  '/unassigned/user',
  deliveryController.getAllUnassignedManualDeliveries
);
router.get(
  '/track/:trackingNumber',
  deliveryController.getDeliveryOrderByTrackingNumber
);
router.get('/sales/:salesOrderId', deliveryController.getDeliveryOrderBySalesOrderId);
router.post('/bookinglabel/:trackingNumber', deliveryController.getBookingLabelLink);
router.post('/assignedByDate', deliveryController.getAssignedManualDeliveriesByDate);
router.post('/unassignedByDate', deliveryController.getUnassignedManualDeliveriesByDate);
router.post('/byUser/assignedByDate', deliveryController.getAssignedManualDeliveriesByDateByUser);
router.post('/shippitDeliveries/date', deliveryController.getShippitOrdersByDate);
router.post('/lalamove/createQuotation', deliveryController.createLalamoveQuotation);
router.post('/lalamove/placeOrder', deliveryController.placeLalamoveOrder);
router.get('/lalamove/order/:id', deliveryController.getLalamoveOrderByLalamoveOrderId);
router.get('/lalamove/:id', deliveryController.getLalamoveOrderByDeliveryOrderId);
router.post('/lalamove/cancel/:id', deliveryController.cancelLalamoveOrder);
router.get('/lalamove/driver/:orderId', deliveryController.getDriverDetails);

module.exports = router;
