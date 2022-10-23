const router = require('express').Router();
const bundleController = require('../controllers/bundleController');

router.post('/', bundleController.createBundle);
router.get('/all', bundleController.getAllBundles);
router.get('/bundleCatalogue', bundleController.findBundlesWithNoBundleCat);
router.get('/:id', bundleController.getBundleById);
router.get('/', bundleController.getBundleByName);
router.put('/', bundleController.updateBundle);
router.delete('/:id', bundleController.deleteBundle);

module.exports = router;
