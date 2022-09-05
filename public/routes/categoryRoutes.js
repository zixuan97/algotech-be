const router = require('express').Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken } = require('../middleware/auth');

router.post('/', categoryController.create);
router.get('/all', categoryController.getAllcategorys);

module.exports = router;
