const router = require('express').Router();
const procurementController = require('../controllers/procurementController');

router.post('/', procurementController.createProcurementOrder);
router.put('/', procurementController.updateProcurementOrder);
router.get('/all', procurementController.getAllProcurementOrders);
router.get('/:id', procurementController.getProcurementOrder);
router.post('/pdf/:id', procurementController.generatePO);
router.post('/email', procurementController.sendProcurementEmail);

module.exports = router;
