const schedule = require('node-schedule');
const emailHelper = require('./email');
const newsletterTemplate = require('../utils/templates/newsletterTemplate');
const scheduledNewsletterModel = require('../models/scheduledNewsletterModel');
const { log } = require('./logger');
const scheduleJobs = async (req) => {
  const { customerEmails, newsletter, sentDate, jobId } = req;

  const job = schedule.scheduleJob(jobId, sentDate, async () => {
    await Promise.all(
      customerEmails.map(async (email) => {
        await emailHelper.sendEmail({
          recipientEmail: email,
          subject: newsletter.emailSubject,
          content: newsletterTemplate(
            newsletter.discountCode,
            newsletter.emailBodyTitle,
            newsletter.emailBody
          )
        });
      })
    );
    log.out('OK_NEWSLETTER_SENT-NEWSLETTERS', customerEmails);

    await scheduledNewsletterModel.updateScheduledNewsLetterStatus({
      jobId,
      jobStatus: 'SENT'
    });
    log.out('OK_NEWSLETTER_UPDATE-SCHEDULED-NEWSLETTER-STATUS', {
      jobId,
      jobStatus: 'SENT'
    });
  });
  return job;
};

const cancelJob = async (req) => {
  const { key } = req;
  const job = schedule.scheduledJobs[key];
  if (job) {
    schedule.scheduledJobs[key].cancel();
  }
  return 'Job cancelled';
};

const rescheduleJob = async (req) => {
  const { newsletter, sentDate } = req;
  const key = `scheduled-newsletter-${newsletter.id}-${sentDate}`;
  const job = schedule.scheduledJobs[key];
  if (job) {
    schedule.scheduledJobs[key].reschedule(sentDate);
  }
  return 'Job updated';
};

const getScheduledNewsLetters = async (req) => {
  jobs = schedule.scheduledJobs;
  return jobs;
};

exports.scheduleJobs = scheduleJobs;
exports.cancelJob = cancelJob;
exports.rescheduleJob = rescheduleJob;
exports.getScheduledNewsLetters = getScheduledNewsLetters;
