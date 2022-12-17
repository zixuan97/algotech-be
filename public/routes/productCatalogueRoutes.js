const router = require('express').Router();
const productCatalogueController = require('../controllers/productCatalogueController');

router.post('/', productCatalogueController.createProductCatalogue);
router.get('/all', productCatalogueController.getAllProductCatalogue);
router.get('/id/:id', productCatalogueController.getProductCatalogue);
router.put('/', productCatalogueController.updateProductCatalogue);
router.delete('/:id', productCatalogueController.deleteProductCatalogue);
module.exports = router;
