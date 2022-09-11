const router = require('express').Router();
const supplierController = require('../controllers/supplierController');

router.post('/', supplierController.createSupplier);
router.get('/all', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplier);
router.get('/', supplierController.getSupplierByName);
router.put('/', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;