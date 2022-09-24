const router = require('express').Router();
const salesOrderController = require('../controllers/salesOrderController');

router.get('/all', salesOrderController.getAllSalesOrders);
router.get('/timefilter', salesOrderController.getAllSalesOrdersWithTimeFilter);
router.get(
  '/timefilterbyday/orders',
  salesOrderController.getSalesOrdersByDayWithTimeFilter
);
router.get(
  '/timefilterbyday/revenue',
  salesOrderController.getRevenueByDayWithTimeFilter
);
router.get(
  '/timefilterbyday/bestseller',
  salesOrderController.getBestSellerByDayWithTimeFilter
);
module.exports = router;
