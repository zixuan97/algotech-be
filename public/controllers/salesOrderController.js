const salesOrderModel = require('../models/salesOrderModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createSalesOrder = async (req, res) => {
  const {
    orderId,
    customerName,
    customerAddress,
    customerContactNo,
    customerEmail,
    postalCode,
    createdTime,
    currency,
    amount,
    customerRemarks,
    salesOrderItems
  } = req.body;
  const salesOrder = await salesOrderModel.findSalesOrderByOrderId({ orderId });
  if (!salesOrder) {
    const { data, error } = await common.awaitWrap(
      salesOrderModel.createSalesOrder({
        orderId,
        customerName,
        customerAddress,
        customerContactNo,
        customerEmail,
        postalCode,
        platformType: 'OTHERS',
        createdTime,
        currency,
        amount,
        customerRemarks,
        orderStatus,
        salesOrderItems
      })
    );

    if (error) {
      log.error('ERR_SALESORDER_CREATE-SO', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_SALESORDER_CREATE-SO');
      res.json(data);
    }
  } else {
    log.error('ERR_SALESORDER_CREATE-SO');
    res.status(400).json({ message: 'Sales orderId already exist!' });
  }
};

const getAllSalesOrders = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    salesOrderModel.getAllSalesOrders({})
  );

  if (error) {
    log.error('ERR_SALESORDER_GET-ALL-SO', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
  }
  log.out('ERR_SALESORDER_GET-ALL-SO');
  res.json(data);
};

const getAllSalesOrdersWithinTimePeriod = async (req, res) => {
  const { time_from, time_to } = req.body;
  const { data, error } = await common.awaitWrap(
    salesOrderModel.getAllSalesOrders({ time_from })
  );

  if (error) {
    log.error('ERR_SALESORDER_GET-ALL-SO', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
  }
  log.out('ERR_SALESORDER_GET-ALL-SO');
  res.json(data);
};

exports.createSalesOrder = createSalesOrder;
exports.getAllSalesOrders = getAllSalesOrders;
