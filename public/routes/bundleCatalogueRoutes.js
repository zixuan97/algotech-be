const router = require('express').Router();
const bundleCatalogueController = require('../controllers/bundleCatalogueController');

router.post('/', bundleCatalogueController.createBundleCatalogue);
router.get('/all', bundleCatalogueController.getAllBundleCatalogue);
router.get('/id/:id', bundleCatalogueController.getBundleCatalogue);
router.put('/', bundleCatalogueController.updateBundleCatalogue);
router.delete('/:id', bundleCatalogueController.deleteBundleCatalogue);
module.exports = router;
