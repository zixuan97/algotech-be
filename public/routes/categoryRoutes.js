const router = require('express').Router();
const categoryController = require('../controllers/categoryController');

router.post('/', categoryController.createCategory);
router.get('/all', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);
router.get('/', categoryController.getCategoryByName);
router.put('/', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
module.exports = router;
