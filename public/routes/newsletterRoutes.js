const router = require('express').Router();
const newsletterController = require('../controllers/newsletterController');

router.post('/', newsletterController.createNewsletter);
router.get('/id/:id', newsletterController.getNewsletter);
router.get('/all', newsletterController.getAllNewsletters);
router.get('/template', newsletterController.generateNewsletterHtml);
module.exports = router;
