const router = require('express').Router();
const shopeeController = require('../controllers/shopeeController');

router.post('/', shopeeController.createKey);
router.get('/', shopeeController.refreshToken);
module.exports = router;
