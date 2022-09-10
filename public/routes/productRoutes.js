const router = require('express').Router();
const productController = require('../controllers/productController');

router.post('/', productController.createProduct);
router.get('/all', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/', productController.getProductByName);
router.get('/sku/:sku', productController.getProductBySku);
router.put('/', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
