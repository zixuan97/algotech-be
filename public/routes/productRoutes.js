const router = require('express').Router();
const productController = require('../controllers/productController');

router.post('/', productController.createProduct);
router.get('/all', productController.getAllProducts);
router.get('/productCatalogue', productController.findProductsWithNoProdCat);
router.get('/:id', productController.getProductById);
router.get('/', productController.getProductByName);
router.get('/sku/:sku', productController.getProductBySku);
router.get('/category/:categoryId', productController.getAllProductsByCategory);
router.get('/location/:locationId', productController.getAllProductsByLocation);
router.get('/brand/:brandId', productController.getAllProductsByBrand);
router.get('/bundle/:bundleId', productController.getAllProductsByBundle);
router.put('/', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/excel', productController.generateExcel);
router.post('/alerts/excel', productController.alertLowInventory);

module.exports = router;
