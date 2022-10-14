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

const createNewsletter = async (req, res) => {
  const {
    name,
    emailSubject,
    emailBodyTitle,
    emailBody,
    discountCode
  } = req.body;
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
    res.json(Error.http(error));
  } else {
    log.out('OK_CUSTOMER_CREATE-NEWSLETTER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
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
    res.json(Error.http(error));
  } else {
    log.out('OK_CUSTOMER_GET-ALL-NEWSLETTERS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
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
    res.json(newsletter);
  } catch (error) {
    log.error('ERR_CUSTOMER_GET-NEWSLETTER-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error getting newsletter');
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
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_NEWSLETTER_UPDATE_NEWSLETTER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
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
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_NEWSLETTER_DELETE_NEWSLETTER', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted newsletter with id:${id}` }
    });
    res.json({ message: `Deleted newsletter with id:${id}` });
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
  res.json(response);
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
  res.json({ message: 'Email sent to customers' });
};

const scheduleNewsLetter = async (req, res) => {
  const { newsletterId, customerEmails, sentDate } = req.body;
  try {
    const newsletter = await newsletterModel.findNewsletterById({
      id: newsletterId
    });
    const job = await scheduleJobs({ newsletter, customerEmails, sentDate });
    log.out('OK_NEWSLETTER_SCHEDULE-NEWSLETTER', job);

    const newsletterJob =
      await scheduledNewsletterModel.createScheduledNewsLetter({
        newsletterId,
        customerEmails,
        sentDate
      });

    log.out('OK_NEWSLETTER_CREATE-NEWSLETTER', {
      req: { body: req.body, params: req.params },
      res: newsletterJob
    });
    res.json(newsletterJob);
  } catch (error) {
    log.error('ERR_NEWSLETTER_SCHEDULE-NEWSLETTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  }
};

const getAllScheduledJobs = async (req, res) => {
  try {
    const scheduledJobs = await getScheduledNewsLetters();
    log.out('OK_NEWSLETTER_GET-SCHEDULED-JOBS', scheduledJobs);

    res.json('ok');
  } catch (error) {
    log.error('ERR_NEWSLETTER_GET-SCHEDULED-JOBS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
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
