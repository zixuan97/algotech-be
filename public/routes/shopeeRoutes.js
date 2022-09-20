const router = require('express').Router();
const shopeeController = require('../controllers/shopeeController');

router.post('/', shopeeController.createKey);
module.exports = router;
