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

const getAllSalesOrdersWithTimeFilter = async (req, res) => {
  const { time_from, time_to } = req.body;
  const { data, error } = await common.awaitWrap(
    salesOrderModel.getAllSalesOrdersWithTimeFilter({
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    })
  );

  if (error) {
    log.error('ERR_SALESORDER_GET-ALL-SO-TIMEFILTER', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
  }
  log.out('ERR_SALESORDER_GET-ALL-SO-TIMEFILTER');
  console.log(data.length);
  res.json(data);
};

const getSalesOrdersByDayWithTimeFilter = async (req, res) => {
  const { time_from, time_to } = req.body;
  const { data, error } = await common.awaitWrap(
    salesOrderModel.getSalesOrdersByDayWithTimeFilter({
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    })
  );

  if (error) {
    log.error('ERR_SALESORDER_GET-SO-BY-DAY-TIMEFILTER', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SALESORDER_GET-SO-BY-DAY-TIMEFILTER');
    res.json(
      JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
        )
      )
    );
  }
};

const getRevenueByDayWithTimeFilter = async (req, res) => {
  const { time_from, time_to } = req.body;
  const { data, error } = await common.awaitWrap(
    salesOrderModel.getRevenueByDayWithTimeFilter({
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    })
  );

  if (error) {
    log.error('ERR_SALESORDER_GET-REVENUE-BY-DAY-TIMEFILTER', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SALESORDER_GET-REVENUE-BY-DAY-TIMEFILTER');
    const str = res.json(
      JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
        )
      )
    );
  }
};

const getBestSellerByDayWithTimeFilter = async (req, res) => {
  const { time_from, time_to } = req.body;
  const { data, error } = await common.awaitWrap(
    salesOrderModel.getBestSellerByDayWithTimeFilter({
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    })
  );

  if (error) {
    log.error(
      'ERR_SALESORDER_GET-BEST-SELLER-BY-DAY-TIMEFILTER',
      error.message
    );
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SALESORDER_GET-BEST-SELLER-BY-DAY-TIMEFILTER');
    const str = res.json(
      JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
        )
      )
    );
  }
};

const findSalesOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const salesOrder = await salesOrderModel.findSalesOrderById({ id });
    log.out('OK_SALESORDER_GET-SALESORDER-BY-ID');
    res.json(salesOrder);
  } catch (error) {
    log.error('ERR_SALESORDER_GET-SALESORDER-BY-ID', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  }
};

const findSalesOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.body;
    const salesOrder = await salesOrderModel.findSalesOrderByOrderId({
      orderId
    });
    log.out('OK_SALESORDER_GET-SALESORDER-BY-ORDER-ID');
    res.json(salesOrder);
  } catch (error) {
    log.error('ERR_SALESORDER_GET-SALESORDER-BY-ORDER-ID', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  }
};
const updateSalesOrderStatus = async (req, res) => {
  try {
    const { id, orderStatus } = req.body;
    const salesOrder = await salesOrderModel.updateSalesOrderStatus({
      id,
      orderStatus
    });
    log.out('OK_SALESORDER_UPDATE-SALESORDER-STATUS');
    res.json({
      message: `Successfully updated sales order status with id: ${id}`
    });
  } catch (error) {
    log.error('ERR_SALESORDER_UPDATE-SALESORDER-STATUS', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  }
};

const updateSalesOrder = async (req, res) => {
  try {
    const {
      id,
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
    const salesOrder = await salesOrderModel.updateSalesOrder({
      id,
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
    });
    log.out('OK_SALESORDER_UPDATE-SALESORDER');
    res.json({ message: `Successfully updated sales order with id: ${id}` });
  } catch (error) {
    log.error('ERR_SALESORDER_UPDATE-SALESORDER', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  }
};

exports.createSalesOrder = createSalesOrder;
exports.getAllSalesOrders = getAllSalesOrders;
exports.getAllSalesOrdersWithTimeFilter = getAllSalesOrdersWithTimeFilter;
exports.getSalesOrdersByDayWithTimeFilter = getSalesOrdersByDayWithTimeFilter;
exports.getRevenueByDayWithTimeFilter = getRevenueByDayWithTimeFilter;
exports.getBestSellerByDayWithTimeFilter = getBestSellerByDayWithTimeFilter;
exports.findSalesOrderById = findSalesOrderById;
exports.findSalesOrderByOrderId = findSalesOrderByOrderId;
exports.updateSalesOrder = updateSalesOrder;
exports.updateSalesOrderStatus = updateSalesOrderStatus;
