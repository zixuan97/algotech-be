const router = require('express').Router();
const locationController = require('../controllers/locationController');

router.post('/', locationController.createLocation);
router.get('/all', locationController.getAllLocations);
router.get('/:id', locationController.getLocation);
router.get('/', locationController.getLocationByName);
router.put('/', locationController.updateLocation);
router.put('/noproduct', locationController.updateLocationWithoutProducts);
router.delete('/:id', locationController.deleteLocation);
router.post('/products/all', locationController.addProductsToLocation);
module.exports = router;
