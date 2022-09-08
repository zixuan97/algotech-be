const router = require('express').Router();
const productController = require('../controllers/productController');

router.post('/', productController.createProduct);
router.get('/all', productController.getAllProducts);
router.get('/:id', productController.getProduct);
router.put('/', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
