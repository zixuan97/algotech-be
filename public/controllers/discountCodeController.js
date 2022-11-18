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

  const { data: discountCodeObj } = await common.awaitWrap(
    discountCodeModel.findDiscountCode({ discountCode })
  );

  // if exists throw error
  if (discountCodeObj) {
    log.error('ERR_DISCOUNTCODE_CREATE-DISCOUNTCODE', {
      err: { message: 'Discount code already exists' },
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Discount code already exists' });
  } else {
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
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_DISCOUNTCODE_CREATE-DISCOUNTCODE', {
        req: { body: req.body, params: req.params },
        res: { message: 'Discount code created' }
      });
      return res.json({ message: 'Discount code created' });
    }
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
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_DISCOUNTCODE_GET-ALL-DISCOUNTCODE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
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
    return res.json(discountCode);
  } catch (error) {
    log.error('ERR_DISCOUNTCODE_GET-DISCOUNTCODE-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting discount code by id');
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
    return res.json(code);
  } catch (error) {
    log.error('ERR_DISCOUNTCODE_GET-DISCOUNTCODE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting discount code');
  }
};

const applyDiscountCode = async (req, res) => {
  try {
    const { discountCode, amount, email } = req.body;
    const code = await discountCodeModel.findDiscountCode({
      discountCode
    });
    const today = new Date();
    if (code) {
      const isValid =
        code.startDate <= today &&
        (code.endDate === null || code.endDate >= today);
      let transactionAmount = amount;
      if (
        (code.customerEmails.includes(email) ||
          (code.customerEmails.length === 0 && code.endDate === null)) &&
        isValid &&
        amount >= code.minOrderAmount
      ) {
        if (code.type === 'PERCENTAGE') {
          transactionAmount = (amount * (100 - code.amount)) / 100;
        } else {
          transactionAmount = amount - code.amount;
        }
        log.out('OK_DISCOUNTCODE_APPLY-DISCOUNTCODE', {
          req: { body: req.body, params: req.params },
          res: JSON.stringify({
            transactionAmount,
            discountType: code.type,
            discountAmount: code.amount
          })
        });
        return res.json({
          transactionAmount,
          discountType: code.type,
          discountAmount: code.amount
        });
      } else if (
        !code.customerEmails.includes(email) &&
        code.customerEmails.length !== 0
      ) {
        log.error('ERR_DISCOUNTCODE_APPLY-DISCOUNTCODE', {
          req: { body: req.body, params: req.params },
          res: { message: 'Invalid Email!' }
        });
        return res.status(400).json({ message: 'Invalid Email!' });
      } else if (!isValid) {
        log.error('ERR_DISCOUNTCODE_APPLY-DISCOUNTCODE', {
          req: { body: req.body, params: req.params },
          res: { message: 'Promo code has expired!' }
        });
        return res.status(400).json({ message: 'Promo code has expired!' });
      } else if (amount < code.minOrderAmount) {
        log.error('ERR_DISCOUNTCODE_APPLY-DISCOUNTCODE', {
          req: { body: req.body, params: req.params },
          res: { message: `Min amount of ${code.amount} is required!` }
        });
        res
          .status(400)
          .json({ message: `Min amount of ${code.amount} is required!` });
      } else {
        log.error('ERR_DISCOUNTCODE_APPLY-DISCOUNTCODE', {
          req: { body: req.body, params: req.params },
          res: { message: 'Invalid promo code!' }
        });
        return res.status(400).json({ message: 'Invalid promo code!' });
      }
    } else {
      log.error('ERR_DISCOUNTCODE_APPLY-DISCOUNTCODE', {
        req: { body: req.body, params: req.params },
        res: { message: 'Invalid promo code!' }
      });
      return res.status(400).json({ message: 'Invalid promo code!' });
    }
  } catch (error) {
    log.error('ERR_DISCOUNTCODE_APPLY-DISCOUNTCODE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error applying discount code');
  }
};

const updateDiscountCode = async (req, res) => {
  const { id, amount, endDate, customerEmails, type, minOrderAmount } =
    req.body;

  const { error } = await common.awaitWrap(
    discountCodeModel.updateDiscountCode({
      id,
      amount,
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
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_DISCOUNTCODE_UPDATE-DISCOUNTCODE', {
      req: { body: req.body, params: req.params },
      res: { message: `Updated discount code with id:${id}` }
    });
    return res.json({ message: `Updated discount code with id:${id}` });
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
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_DISCOUNTCODE_DELETE-DISCOUNTCODE', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted discount code with id:${id}` }
    });
    return res.json({ message: `Deleted discount code with id:${id}` });
  }
};

exports.createDiscountCode = createDiscountCode;
exports.getDiscountCode = getDiscountCode;
exports.getDiscountCodeById = getDiscountCodeById;
exports.updateDiscountCode = updateDiscountCode;
exports.deleteDiscountCode = deleteDiscountCode;
exports.getAllDiscountCodes = getAllDiscountCodes;
exports.applyDiscountCode = applyDiscountCode;
