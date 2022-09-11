const router = require('express').Router();
const procurementController = require('../controllers/procurementController');

router.post('/', procurementController.createProcurementOrder);
router.put('/', procurementController.updateProcurementOrder);
router.get('/all', procurementController.getAllProcurementOrders);
router.get('/:id', procurementController.getProcurementOrder);

module.exports = router;
