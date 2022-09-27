const router = require('express').Router();
const salesOrderController = require('../controllers/salesOrderController');

router.get('/all', salesOrderController.getAllSalesOrders);
router.post(
  '/timefilter',
  salesOrderController.getAllSalesOrdersWithTimeFilter
);
router.post(
  '/timefilterbyday/orders',
  salesOrderController.getSalesOrdersByDayWithTimeFilter
);
router.post(
  '/timefilterbyday/revenue',
  salesOrderController.getRevenueByDayWithTimeFilter
);
router.post(
  '/timefilterbyday/bestseller',
  salesOrderController.getBestSellerWithTimeFilter
);
router.post(
  '/timefilterbyday/ordersbyplatform',
  salesOrderController.getOrdersByPlatformWithTimeFilter
);
router.post('/', salesOrderController.createSalesOrder);
router.get('/id/:id', salesOrderController.findSalesOrderById);
router.get('/orderid', salesOrderController.findSalesOrderByOrderId);
router.put('/', salesOrderController.updateSalesOrder);
router.put('/status', salesOrderController.updateSalesOrderStatus);
module.exports = router;
