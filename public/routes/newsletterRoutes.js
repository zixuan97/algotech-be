const router = require('express').Router();
const newsletterController = require('../controllers/newsletterController');

router.post('/', newsletterController.createNewsletter);
router.get('/id/:id', newsletterController.getNewsletter);
router.get('/all', newsletterController.getAllNewsletters);

module.exports = router;
