const newsletterModel = require('../models/newsletterModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const fs = require('fs');
const emailHelper = require('../helpers/email');
const newsletterTemplate = require('../utils/templates/newsletterTemplate');

const createNewsletter = async (req, res) => {
  const {
    emailDate,
    name,
    emailSubject,
    emailBodyTitle,
    emailBody,
    discountCode
  } = req.body;
  const { data, error } = await common.awaitWrap(
    newsletterModel.createNewsletter({
      emailDate: new Date(emailDate),
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
      res: data
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
      res: data
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
      res: newsletter
    });
    res.json(newsletter);
  } catch (error) {
    log.error('ERR_CUSTOMER_GET-NEWSLETTER-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(500).send('Server Error');
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
    log.error('ERR_NEWSLETTER_UPDATE_NEWSLETTER', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_NEWSLETTER_UPDATE_NEWSLETTER');
    res.json(data);
  }
};

const deleteNewsletter = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(
    newsletterModel.deleteNewsletter({ id })
  );
  if (error) {
    log.error('ERR_NEWSLETTER_DELETE_NEWSLETTER', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_NEWSLETTER_DELETE_NEWSLETTER');
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

exports.createNewsletter = createNewsletter;
exports.getAllNewsletters = getAllNewsletters;
exports.getNewsletter = getNewsletter;
exports.updateNewsletter = updateNewsletter;
exports.deleteNewsletter = deleteNewsletter;
exports.generateNewsletterHtml = generateNewsletterHtml;
exports.sendNewsLetter = sendNewsLetter;
