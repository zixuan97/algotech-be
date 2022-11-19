const router = require('express').Router();
const supplierController = require('../controllers/supplierController');

router.post('/', supplierController.createSupplier);
router.get('/all', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplier);
router.put('/', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);
router.post('/addProduct', supplierController.addProductToSupplier);
router.get('/products/all', supplierController.getAllSupplierProducts);
router.get('/products/:id', supplierController.getAllProductsBySupplier);
router.delete(
  '/:supplierId/:productId',
  supplierController.deleteProductBySupplier
);
router.get('/currencies/all', supplierController.getAllCurrencies);

module.exports = router;
