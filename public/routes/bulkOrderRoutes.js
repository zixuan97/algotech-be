const router = require('express').Router();
const bulkOrderController = require('../controllers/bulkOrderController');

router.get('/all', bulkOrderController.getAllBulkOrders);
router.post('/', bulkOrderController.createBulkOrder);
router.get('/id/:id', bulkOrderController.findBulkOrderById);
router.get('/orderid/:orderId', bulkOrderController.findBulkOrderByOrderId);
router.get('/email/:payeeEmail', bulkOrderController.findBulkOrderByEmail);
router.post('/timefilter', bulkOrderController.getAllBulkOrdersWithTimeFilter);
router.put('/', bulkOrderController.updateBulkOrder);
router.put('/status', bulkOrderController.updateBulkOrderStatus);
router.put('/salesOrderStatus', bulkOrderController.massUpdateSalesOrderStatus);
router.post('/excel', bulkOrderController.generateExcel);
router.post('/pdf/:id', bulkOrderController.generateBulkOrderSummaryPDF);
module.exports = router;
