const router = require('express').Router();
const discountCodeController = require('../controllers/discountCodeController');

router.post('/', discountCodeController.createDiscountCode);
router.get('/all', discountCodeController.getAllDiscountCodes);
router.get('/code/:discountCode', discountCodeController.getDiscountCode);
router.get('/id/:id', discountCodeController.getDiscountCodeById);
router.put('/', discountCodeController.updateDiscountCode);
router.delete('/:id', discountCodeController.deleteDiscountCode);
router.post('/apply', discountCodeController.applyDiscountCode);
module.exports = router;
