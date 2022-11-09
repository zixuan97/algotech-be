const discountCodeModel = require('../models/discountCodeModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createDiscountCode = async (req, res) => {
  const {
    discountCode,
    amount,
    startDate,
    endDate,
    customerEmails,
    type,
    minOrderAmount
  } = req.body;

  const { error } = await common.awaitWrap(
    discountCodeModel.createDiscountCode({
      discountCode,
      amount,
      startDate,
      endDate,
      customerEmails,
      type,
      minOrderAmount
    })
  );
  if (error) {
    log.error('ERR_DISCOUNTCODE_CREATE-DISCOUNTCODE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_DISCOUNTCODE_CREATE-DISCOUNTCODE', {
      req: { body: req.body, params: req.params },
      res: { message: 'Discount code created' }
    });
    res.json({ message: 'Discount code created' });
  }
};

const getAllDiscountCodes = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    discountCodeModel.getAllDiscountCodes({})
  );

  if (error) {
    log.error('ERR_DISCOUNTCODE_GET-ALL-DISCOUNTCODE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_DISCOUNTCODE_GET-ALL-DISCOUNTCODE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getDiscountCodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const discountCode = await discountCodeModel.findDiscountCodeById({
      id
    });

    log.out('OK_DISCOUNTCODE_GET-DISCOUNTCODE-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(discountCode)
    });
    res.json(discountCode);
  } catch (error) {
    log.error('ERR_DISCOUNTCODE_GET-DISCOUNTCODE-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error getting discount code by id');
  }
};

const getDiscountCode = async (req, res) => {
  try {
    const { discountCode } = req.params;
    const code = await discountCodeModel.findDiscountCode({
      discountCode
    });

    log.out('OK_DISCOUNTCODE_GET-DISCOUNTCODE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(code)
    });
    res.json(code);
  } catch (error) {
    log.error('ERR_DISCOUNTCODE_GET-DISCOUNTCODE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error getting discount code');
  }
};

const updateDiscountCode = async (req, res) => {
  const {
    id,
    discountCode,
    amount,
    startDate,
    endDate,
    customerEmails,
    type,
    minOrderAmount
  } = req.body;

  const { error } = await common.awaitWrap(
    discountCodeModel.updateDiscountCode({
      id,
      discountCode,
      amount,
      startDate,
      endDate,
      customerEmails,
      type,
      minOrderAmount
    })
  );

  if (error) {
    log.error('ERR_DISCOUNTCODE_UPDATE-DISCOUNTCODE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_DISCOUNTCODE_UPDATE-DISCOUNTCODE', {
      req: { body: req.body, params: req.params },
      res: { message: `Updated discount code with id:${id}` }
    });
    res.json({ message: `Updated discount code with id:${id}` });
  }
};

const deleteDiscountCode = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(
    discountCodeModel.deleteDiscountCode({ id })
  );
  if (error) {
    log.error('ERR_DISCOUNTCODE_DELETE-DISCOUNTCODE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_DISCOUNTCODE_DELETE-DISCOUNTCODE', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted discount code with id:${id}` }
    });
    res.json({ message: `Deleted discount code with id:${id}` });
  }
};

exports.createDiscountCode = createDiscountCode;
exports.getDiscountCode = getDiscountCode;
exports.getDiscountCodeById = getDiscountCodeById;
exports.updateDiscountCode = updateDiscountCode;
exports.deleteDiscountCode = deleteDiscountCode;
exports.getAllDiscountCodes = getAllDiscountCodes;
