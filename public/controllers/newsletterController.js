const newsletterModel = require('../models/newsletterModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

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
      emailDate,
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
const generateNewsletterHtml = async (req, res) => {
  const path = process.cwd() + '/public/newsletter.html';
  res.sendFile(path);
};

exports.createNewsletter = createNewsletter;
exports.getAllNewsletters = getAllNewsletters;
exports.getNewsletter = getNewsletter;
exports.generateNewsletterHtml = generateNewsletterHtml;
