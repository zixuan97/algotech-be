const newsletterModel = require('../models/newsletterModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const fs = require("fs");

const createNewsletter = async (req, res) => {
  const { emailDate, name, emailSubject, emailBodyTitle, emailBody, discountCode } = req.body;
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
    log.error('ERR_CUSTOMER_CREATE-NEWSLETTER', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_CUSTOMER_CREATE-NEWSLETTER');
    res.json(data);
  }
};

const getAllNewsletters = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    newsletterModel.getAllNewsletters({})
  );
  if (error) {
    log.error('ERR_CUSTOMER_GET-ALL-NEWSLETTERS', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_CUSTOMER_GET-ALL-NEWSLETTERS');
    res.json(data);
  }
};
  
const getNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const newsletter = await newsletterModel.findNewsletterById({ id });
    log.out('OK_CUSTOMER_GET-NEWSLETTER-BY-ID');
    res.json(newsletter);
  } catch (error) {
    log.error('ERR_CUSTOMER_GET-NEWSLETTER-BY-ID', error.message);
    res.status(500).send('Server Error');
  }
};

const updateNewsletter = async (req, res) => {
  const { id, name, emailSubject, emailBodyTitle, emailBody, discountCode } = req.body;
  const { data, error } = await common.awaitWrap(
    newsletterModel.updateNewsletter({ id, name, emailSubject, emailBodyTitle, emailBody, discountCode })
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
  content = content.replace("sample", title);
  content = content.replace("placeholder", contentBody);
  content = content.replace("test", discountCode);
  fs.writeFileSync(temp, content, 'utf-8');
  res.sendFile(temp);
};

exports.createNewsletter = createNewsletter;
exports.getAllNewsletters = getAllNewsletters;
exports.getNewsletter = getNewsletter;
exports.updateNewsletter = updateNewsletter;
exports.deleteNewsletter = deleteNewsletter;
exports.generateNewsletterHtml = generateNewsletterHtml;
