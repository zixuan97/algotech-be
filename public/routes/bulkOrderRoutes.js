const router = require('express').Router();
const bulkOrderController = require('../controllers/bulkOrderController');

router.get('/all', bulkOrderController.getAllBulkOrders);
router.post('/', bulkOrderController.createBulkOrder);
router.get('/id/:id', bulkOrderController.findBulkOrderById);
router.get('/orderid/:orderId', bulkOrderController.findBulkOrderByOrderId);
router.get('/email/:payeeEmail', bulkOrderController.findBulkOrderByEmail);
router.post('/timefilter', bulkOrderController.getAllBulkOrdersWithTimeFilter);
router.put('/', bulkOrderController.updateBulkOrder);
module.exports = router;
