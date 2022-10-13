const router = require('express').Router();
const newsletterController = require('../controllers/newsletterController');

router.post('/', newsletterController.createNewsletter);
router.get('/all', newsletterController.getAllNewsletters);
router.get('/:id', newsletterController.getNewsletter);
router.post('/template', newsletterController.generateNewsletterHtml);
router.put('/', newsletterController.updateNewsletter);
router.delete('/:id', newsletterController.deleteNewsletter);
router.post('/email', newsletterController.sendNewsLetter);
router.post(
  '/emails',
  newsletterController.sendNewsLetterToRecommendedCustomers
);
router.get('/schedule/jobs', newsletterController.getAllScheduledJobs);
router.post('/schedule', newsletterController.scheduleNewsLetter);
module.exports = router;
