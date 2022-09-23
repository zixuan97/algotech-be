const router = require('express').Router();
const salesOrderController = require('../controllers/salesOrderController');

router.get('/all', salesOrderController.getAllSalesOrders);

module.exports = router;
