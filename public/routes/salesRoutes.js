const router = require('express').Router();
const salesOrderController = require('../controllers/salesOrderController');

router.get('/all', salesOrderController.getAllSalesOrders);
router.post(
  '/timefilter',
  salesOrderController.getAllSalesOrdersWithTimeFilter
);
router.post(
  '/timefilter/products',
  salesOrderController.getAllSalesOrderItemsWithTimeFilter
);
router.post(
  '/timefilterbyday/orders',
  salesOrderController.getSalesOrdersByDayWithTimeFilter
);
router.post(
  '/timefilterbyday/average/orders',
  salesOrderController.getAverageNumberofSalesOrdersWithTimeFilter
);
router.post(
  '/timefilterbyday/average/value/orders',
  salesOrderController.getAverageValueofSalesOrdersWithTimeFilter
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
  '/timefilterbyday/items/bestseller',
  salesOrderController.getBestSellerSalesOrderItemWithTimeFilter
);
router.post(
  '/timefilterbyday/ordersbyplatform',
  salesOrderController.getOrdersByPlatformWithTimeFilter
);
router.post(
  '/timefilterbyday/products',
  salesOrderController.getSalesOfProductOverTimeWithTimeFilter
);
router.post('/', salesOrderController.createSalesOrder);
router.post('/excel', salesOrderController.generateExcel);
router.get('/id/:id', salesOrderController.findSalesOrderById);
router.get('/orderid/:orderId', salesOrderController.findSalesOrderByOrderId);
router.put('/', salesOrderController.updateSalesOrder);
router.put('/status', salesOrderController.updateSalesOrderStatus);
module.exports = router;
