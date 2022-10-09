const customerModel = require('../models/customerModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createNewsletter = async (req, res) => {
  const { emailDate, name, emailSubject, emailBodyTitle, emailBody, discountCode } = req.body;
  const { data, error } = await common.awaitWrap(
    customerModel.createNewsletter({
      emailDate,
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
    customerModel.getAllNewsletters({})
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
    const newsletter = await customerModel.findNewsletterById({ id });
    log.out('OK_CUSTOMER_GET-NEWSLETTER-BY-ID');
    res.json(newsletter);
  } catch (error) {
    log.error('ERR_CUSTOMER_GET-NEWSLETTER-BY-ID', error.message);
    res.status(500).send('Server Error');
  }
};

const generateNewsletterHtml = async (req, res) => {
  const path = process.cwd() + '/public/newsletter.html';
  res.sendFile(path);
};

exports.createNewsletter = createNewsletter;
exports.getAllNewsletters = getAllNewsletters;
exports.getNewsletter = getNewsletter;
exports.generateNewsletterHtml = generateNewsletterHtml;