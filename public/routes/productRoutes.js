const router = require('express').Router();
const productController = require('../controllers/productController');

router.post('/', productController.createProduct);
router.get('/all', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/', productController.getProductByName);
router.get('/sku/:sku', productController.getProductBySku);
router.get('/category/:categoryId', productController.getAllProductsByCategory);
router.get('/location/:locationId', productController.getAllProductsByLocation);
router.get('/brand/:brandId', productController.getAllProductsByBrand);
router.put('/', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/excel', productController.generateExcel);
router.post('/alerts/excel', productController.alertLowInventory);

module.exports = router;
