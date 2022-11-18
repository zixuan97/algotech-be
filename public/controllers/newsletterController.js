const newsletterModel = require('../models/newsletterModel');
const scheduledNewsletterModel = require('../models/scheduledNewsletterModel');
const {
  scheduleJobs,
  cancelJob,
  rescheduleJob,
  getScheduledNewsLetters
} = require('../helpers/scheduler');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const fs = require('fs');
const emailHelper = require('../helpers/email');
const newsletterTemplate = require('../utils/templates/newsletterTemplate');
const { uuid } = require('uuidv4');

const createNewsletter = async (req, res) => {
  const { name, emailSubject, emailBodyTitle, emailBody, discountCode } =
    req.body;
  const { data, error } = await common.awaitWrap(
    newsletterModel.createNewsletter({
      name,
      emailSubject,
      emailBodyTitle,
      emailBody,
      discountCode
    })
  );
  if (error) {
    log.error('ERR_CUSTOMER_CREATE-NEWSLETTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.json(Error.http(error));
  } else {
    log.out('OK_CUSTOMER_CREATE-NEWSLETTER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getAllNewsletters = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    newsletterModel.getAllNewsletters({})
  );
  if (error) {
    log.error('ERR_CUSTOMER_GET-ALL-NEWSLETTERS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.json(Error.http(error));
  } else {
    log.out('OK_CUSTOMER_GET-ALL-NEWSLETTERS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const newsletter = await newsletterModel.findNewsletterById({ id });
    log.out('OK_CUSTOMER_GET-NEWSLETTER-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(newsletter)
    });
    return res.json(newsletter);
  } catch (error) {
    log.error('ERR_CUSTOMER_GET-NEWSLETTER-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting newsletter');
  }
};

const updateNewsletter = async (req, res) => {
  const { id, name, emailSubject, emailBodyTitle, emailBody, discountCode } =
    req.body;
  const { data, error } = await common.awaitWrap(
    newsletterModel.updateNewsletter({
      id,
      name,
      emailSubject,
      emailBodyTitle,
      emailBody,
      discountCode
    })
  );
  if (error) {
    log.error('ERR_NEWSLETTER_UPDATE_NEWSLETTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_NEWSLETTER_UPDATE_NEWSLETTER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const deleteNewsletter = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(
    newsletterModel.deleteNewsletter({ id })
  );
  if (error) {
    log.error('ERR_NEWSLETTER_DELETE_NEWSLETTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_NEWSLETTER_DELETE_NEWSLETTER', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted newsletter with id:${id}` }
    });
    return res.json({ message: `Deleted newsletter with id:${id}` });
  }
};

const generateNewsletterHtml = async (req, res) => {
  const { title, contentBody, discountCode } = req.body;
  const path = process.cwd() + '/public/newsletter.html';
  const temp = process.cwd() + '/public/temp.html';
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace('sample', title);
  content = content.replace('placeholder', contentBody);
  content = content.replace('test', discountCode);
  fs.writeFileSync(temp, content, 'utf-8');
  res.sendFile(temp);
};

const sendNewsLetter = async (req, res) => {
  const { email, id } = req.body;
  const newsletter = await newsletterModel.findNewsletterById({ id });

  const response = await emailHelper.sendEmail({
    recipientEmail: email,
    subject: newsletter.emailSubject,
    content: newsletterTemplate(
      newsletter.discountCode,
      newsletter.emailBodyTitle,
      newsletter.emailBody
    )
  });
  return res.json(response);
};

const sendNewsLetterToRecommendedCustomers = async (req, res) => {
  const { emails, id } = req.body;
  const newsletter = await newsletterModel.findNewsletterById({ id });
  await Promise.all(
    emails.map(async (email) => {
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
  return res.json({ message: 'Email sent to customers' });
};

const scheduleNewsLetter = async (req, res) => {
  const { newsletterId, customerEmails, sentDate } = req.body;
  try {
    const newsletter = await newsletterModel.findNewsletterById({
      id: newsletterId
    });
    const jobId = uuid();
    const job = await scheduleJobs({
      newsletter,
      customerEmails,
      sentDate,
      jobId
    });
    log.out('OK_NEWSLETTER_SCHEDULE-NEWSLETTER', job);

    const newsletterJob =
      await scheduledNewsletterModel.createScheduledNewsLetter({
        newsletterId,
        customerEmails,
        sentDate,
        jobId
      });

    log.out('OK_NEWSLETTER_CREATE-NEWSLETTER', {
      req: { body: req.body, params: req.params },
      res: { message: `Newsletter scheduled for ${sentDate}` }
    });
    return res.json({ message: `Newsletter scheduled for ${sentDate}` });
  } catch (error) {
    log.error('ERR_NEWSLETTER_SCHEDULE-NEWSLETTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const getAllScheduledNewsletters = async (req, res) => {
  const { time_from, time_to } = req.body;
  try {
    const scheduledNewsletters =
      await scheduledNewsletterModel.getAllScheduledNewsLetters({
        time_from,
        time_to
      });

    log.out('OK_NEWSLETTER_GET-ALL-SCHEDULED-NEWSLETTERS', {
      req: { body: req.body, params: req.params },
      res: scheduledNewsletters
    });
    return res.json(scheduledNewsletters);
  } catch (error) {
    log.error('ERR_NEWSLETTER_GET-ALL-SCHEDULED-NEWSLETTERS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const getAllScheduledNewslettersByJobStatus = async (req, res) => {
  const { jobStatus, time_from, time_to } = req.body;
  try {
    const scheduledNewsletters =
      await scheduledNewsletterModel.getAllScheduledNewsLettersByJobStatus({
        jobStatus,
        time_from,
        time_to
      });

    log.out('OK_NEWSLETTER_GET-ALL-SCHEDULED-NEWSLETTERS', {
      req: { body: req.body, params: req.params },
      res: scheduledNewsletters
    });
    return res.json(scheduledNewsletters);
  } catch (error) {
    log.error('ERR_NEWSLETTER_GET-ALL-SCHEDULED-NEWSLETTERS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const getScheduledNewsletterById = async (req, res) => {
  const { id } = req.params;
  try {
    const scheduledNewsletter =
      await scheduledNewsletterModel.findScheduledNewsletterById({ id });

    log.out('OK_NEWSLETTER_GET-SCHEDULED-NEWSLETTER-BY-ID', {
      req: { body: req.body, params: req.params },
      res: scheduledNewsletter
    });
    return res.json(scheduledNewsletter);
  } catch (error) {
    log.error('ERR_NEWSLETTER_GET-ALL-SCHEDULED-NEWSLETTER-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const getScheduledNewsletterByNewsletterId = async (req, res) => {
  const { newsletterId } = req.body;
  try {
    const scheduledNewsletters =
      await scheduledNewsletterModel.findScheduledNewsletterByNewsletterId({
        newsletterId
      });

    log.out('OK_NEWSLETTER_GET-SCHEDULED-NEWSLETTER-BY-NEWSLETTER-ID', {
      req: { body: req.body, params: req.params },
      res: scheduledNewsletters
    });
    return res.json(scheduledNewsletters);
  } catch (error) {
    log.error('ERR_NEWSLETTER_GET-ALL-SCHEDULED-NEWSLETTER-BY-NEWSLETTER-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const updateScheduledNewsLetter = async (req, res) => {
  const { id, newsletterId, customerEmails, sentDate, jobId } = req.body;
  try {
    //cancel background job
    await cancelJob({ key: jobId });

    const newsletter = await newsletterModel.findNewsletterById({
      id: newsletterId
    });
    const job = await scheduleJobs({
      newsletter,
      customerEmails,
      sentDate,
      jobId
    });
    log.out('OK_NEWSLETTER_SCHEDULE-NEWSLETTER', job);

    const newsletterJob =
      await scheduledNewsletterModel.updateScheduledNewsLetter({
        id,
        newsletterId,
        customerEmails,
        sentDate,
        jobId
      });

    log.out('OK_NEWSLETTER_UPDATE-SCHEDULED-NEWSLETTER', {
      req: { body: req.body, params: req.params },
      res: { message: `Newsletter scheduled for ${sentDate}` }
    });
    return res.json({ message: `Newsletter updated and scheduled for ${sentDate}` });
  } catch (error) {
    log.error('ERR_NEWSLETTER_UPDATED-SCHEDULED-NEWSLETTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const cancelScheduledNewsletter = async (req, res) => {
  const { jobId } = req.body;
  try {
    await cancelJob({ key: jobId });
    await scheduledNewsletterModel.updateScheduledNewsLetterStatus({
      jobId,
      jobStatus: 'CANCELLED'
    });
    log.out('OK_NEWSLETTER_CANCEL-SCHEDULED-NEWSLETTER', {
      req: { body: req.body, params: req.params },
      res: { message: `Scheduled Newsletter cancelled ` }
    });
    return res.json({ message: `Scheduled Newsletter cancelled ` });
  } catch (error) {
    log.error('ERR_NEWSLETTER_CANCEL-SCHEDULED-NEWSLETTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const getAllScheduledJobs = async (req, res) => {
  try {
    const scheduledJobs = await getScheduledNewsLetters();
    log.out('OK_NEWSLETTER_GET-SCHEDULED-JOBS', scheduledJobs);

    return res.json('ok');
  } catch (error) {
    log.error('ERR_NEWSLETTER_GET-SCHEDULED-JOBS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

exports.createNewsletter = createNewsletter;
exports.getAllNewsletters = getAllNewsletters;
exports.getNewsletter = getNewsletter;
exports.updateNewsletter = updateNewsletter;
exports.deleteNewsletter = deleteNewsletter;
exports.generateNewsletterHtml = generateNewsletterHtml;
exports.sendNewsLetter = sendNewsLetter;
exports.sendNewsLetterToRecommendedCustomers =
  sendNewsLetterToRecommendedCustomers;
exports.scheduleNewsLetter = scheduleNewsLetter;
exports.getAllScheduledJobs = getAllScheduledJobs;
exports.getAllScheduledNewsletters = getAllScheduledNewsletters;
exports.updateScheduledNewsLetter = updateScheduledNewsLetter;
exports.getScheduledNewsletterById = getScheduledNewsletterById;
exports.cancelScheduledNewsletter = cancelScheduledNewsletter;
exports.getAllScheduledNewslettersByJobStatus =
  getAllScheduledNewslettersByJobStatus;
exports.getScheduledNewsletterByNewsletterId =
  getScheduledNewsletterByNewsletterId;
