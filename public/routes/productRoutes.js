const router = require('express').Router();
const productController = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');

router.post('/', productController.createProduct);
router.get('/all', productController.getAllProducts);
router.put('/', productController.updateProduct);
router.delete('/', productController.deleteProduct);

module.exports = router;
