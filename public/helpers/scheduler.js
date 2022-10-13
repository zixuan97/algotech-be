const schedule = require('node-schedule');
const emailHelper = require('./email');
const newsletterTemplate = require('../utils/templates/newsletterTemplate');

const scheduleJobs = async (req) => {
  const { customerEmails, newsletter, sentDate } = req;

  const job = schedule.scheduleJob(
    `scheduled-newsletter-${newsletter.id}-${sentDate}`,
    sentDate,
    async () => {
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
    }
  );
  return job;
};

const cancelJob = async (req) => {
  const { newsletter, sentDate } = req;
  const key = `scheduled-newsletter-${newsletter.id}-${sentDate}`;
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
