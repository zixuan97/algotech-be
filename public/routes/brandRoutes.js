const router = require('express').Router();
const brandController = require('../controllers/brandController');

router.post('/', brandController.createBrand);
router.get('/all', brandController.getAllBrands);
router.get('/:id', brandController.getBrand);
router.get('/', brandController.getBrandByName);
router.put('/', brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);
module.exports = router;
