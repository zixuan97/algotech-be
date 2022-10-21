const router = require('express').Router();
const newsletterController = require('../controllers/newsletterController');

router.post('/', newsletterController.createNewsletter);
router.get('/all', newsletterController.getAllNewsletters);
router.get('/schedule', newsletterController.getAllScheduledNewsletters);

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
router.post(
  '/schedule/jobStatus',
  newsletterController.getAllScheduledNewslettersByJobStatus
);
router.post('/schedule', newsletterController.scheduleNewsLetter);
router.post(
  '/schedule/newsletterId',
  newsletterController.getScheduledNewsletterByNewsletterId
);
router.put('/schedule', newsletterController.updateScheduledNewsLetter);
router.get('/schedule/:id', newsletterController.getScheduledNewsletterById);
router.put('/schedule/cancel', newsletterController.cancelScheduledNewsletter);
module.exports = router;
