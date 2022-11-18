const salesOrderModel = require('../models/salesOrderModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { generateSalesOrderExcel } = require('../helpers/excel');
const { format } = require('date-fns');

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
      log.error('ERR_SALESORDER_CREATE-SO', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_SALESORDER_CREATE-SO', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
  } else {
    log.error('ERR_SALESORDER_CREATE-SO', {
      err: 'Sales orderId already exist!',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Sales orderId already exist!' });
  }
};

const getAllSalesOrders = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    salesOrderModel.getAllSalesOrders({})
  );

  if (error) {
    log.error('ERR_SALESORDER_GET-ALL-SO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
  }
  log.out('OK_SALESORDER_GET-ALL-SO', {
    req: { body: req.body, params: req.params },
    res: JSON.stringify(data)
  });
  return res.json(data);
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
    log.error('ERR_SALESORDER_GET-ALL-SO-TIMEFILTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
  log.out('OK_SALESORDER_GET-ALL-SO-TIMEFILTER', {
    req: { body: req.body, params: req.params },
    res: JSON.stringify(data)
  });
  return res.json(data);
};

const getAverageNumberofSalesOrdersWithTimeFilter = async (req, res) => {
  const { time_from, time_to } = req.body;
  const { data, error } = await common.awaitWrap(
    salesOrderModel.getAllSalesOrdersWithTimeFilter({
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    })
  );

  if (error) {
    log.error('ERR_SALESORDER_GET-AVERAGE-NUM-SO-TIMEFILTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }

  var d1 = new Date(time_from);
  var d2 = new Date(time_to);
  const diffInDays = (d2 - d1) / (1000 * 3600 * 24);
  const avgNumOfOrders = data.length / diffInDays;
  log.out('OK_SALESORDER_GET-AVERAGE-NUM-SO-TIMEFILTER', {
    req: { body: req.body, params: req.params },
    res: JSON.stringify(avgNumOfOrders)
  });

  return res.json(avgNumOfOrders);
};

const getAverageValueofSalesOrdersWithTimeFilter = async (req, res) => {
  const { time_from, time_to } = req.body;
  const { data, error } = await common.awaitWrap(
    salesOrderModel.getTotalValueOfOrdersWithTimeFilter({
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    })
  );

  if (error) {
    log.error('ERR_SALESORDER_GET-AVERAGE-VALUE-SO-TIMEFILTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }

  var d1 = new Date(time_from);
  var d2 = new Date(time_to);
  const diffInDays = (d2 - d1) / (1000 * 3600 * 24);
  const avgValueOfOrders = data[0].amount / diffInDays;
  log.out('OK_SALESORDER_GET-AVERAGE-NUM-VALUE-TIMEFILTER', {
    req: { body: req.body, params: req.params },
    res: JSON.stringify(avgValueOfOrders)
  });
  return res.json(avgValueOfOrders);
};

const getAllSalesOrderItemsWithTimeFilter = async (req, res) => {
  const { time_from, time_to } = req.body;
  const { data, error } = await common.awaitWrap(
    salesOrderModel.getAllSalesOrderItemsWithTimeFilter({
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    })
  );

  if (error) {
    log.error('ERR_SALESORDER_GET-ALL-SOI-TIMEFILTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
  log.out('OK_SALESORDER_GET-ALL-SOI-TIMEFILTER', {
    req: { body: req.body, params: req.params },
    res: JSON.stringify(data)
  });
  return res.json(data);
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
    log.error('ERR_SALESORDER_GET-SO-BY-DAY-TIMEFILTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_SALESORDER_GET-SO-BY-DAY-TIMEFILTER', {
      req: { body: req.body, params: req.params },
      res: JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
        )
      )
    });

    return res.json(
      JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
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
    log.error('ERR_SALESORDER_GET-REVENUE-BY-DAY-TIMEFILTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_SALESORDER_GET-REVENUE-BY-DAY-TIMEFILTER', {
      req: { body: req.body, params: req.params },
      res: JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
        )
      )
    });
    return res.json(
      JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
        )
      )
    );
  }
};

const getBestSellerWithTimeFilter = async (req, res) => {
  const { time_from, time_to } = req.body;
  const { data, error } = await common.awaitWrap(
    salesOrderModel.getBestSellerWithTimeFilter({
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    })
  );

  if (error) {
    log.error('ERR_SALESORDER_GET-BEST-SELLER-TIMEFILTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_SALESORDER_GET-BEST-SELLER-TIMEFILTER', {
      req: { body: req.body, params: req.params },
      res: JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
        )
      )
    });
    return res.json(
      JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
        )
      )
    );
  }
};

const getOrdersByPlatformWithTimeFilter = async (req, res) => {
  const { time_from, time_to } = req.body;
  const { data, error } = await common.awaitWrap(
    salesOrderModel.getOrdersByPlatformWithTimeFilter({
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    })
  );

  if (error) {
    log.error('ERR_SALESORDER_GET-ORDERS-BY-PLATFORM-TIMEFILTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_SALESORDER_GET-ORDERS-BY-PLATFORM-TIMEFILTER', {
      req: { body: req.body, params: req.params },
      res: JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
        )
      )
    });
    return res.json(
      JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
        )
      )
    );
  }
};

const getSalesOfProductOverTimeWithTimeFilter = async (req, res) => {
  const { time_from, time_to, productName } = req.body;
  const { data, error } = await common.awaitWrap(
    salesOrderModel.getSalesOfProductOverTimeWithTimeFilter({
      productName,
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    })
  );

  if (error) {
    log.error('ERR_SALESORDER_GET-SALES-OF-PRODUCT-OVER-TIME-TIMEFILTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_SALESORDER_GET-SALES-OF-PRODUCT-OVER-TIME-TIMEFILTER', {
      req: { body: req.body, params: req.params },
      res: JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
        )
      )
    });
    return res.json(
      JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
        )
      )
    );
  }
};

const getBestSellerSalesOrderItemWithTimeFilter = async (req, res) => {
  const { time_from, time_to } = req.body;
  const { data, error } = await common.awaitWrap(
    salesOrderModel.getBestSellerSalesOrderItemWithTimeFilter({
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    })
  );

  if (error) {
    log.error('ERR_SALESORDER_GET-BESTSELLER-PRODUCT-TIMEFILTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_SALESORDER_GET-BESTSELLER-PRODUCT-TIMEFILTER', {
      req: { body: req.body, params: req.params },
      res: JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
        )
      )
    });
    return res.json(
      JSON.parse(
        JSON.stringify(
          data,
          (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
        )
      )
    );
  }
};

const findSalesOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const salesOrder = await salesOrderModel.findSalesOrderById({ id });
    log.out('OK_SALESORDER_GET-SALESORDER-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(salesOrder)
    });
    return res.json(salesOrder);
  } catch (error) {
    log.error('ERR_SALESORDER_GET-SALESORDER-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const findSalesOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const salesOrder = await salesOrderModel.findSalesOrderByOrderId({
      orderId
    });
    log.out('OK_SALESORDER_GET-SALESORDER-BY-ORDER-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(salesOrder)
    });
    return res.json(salesOrder);
  } catch (error) {
    log.error('ERR_SALESORDER_GET-SALESORDER-BY-ORDER-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};
const updateSalesOrderStatus = async (req, res) => {
  try {
    const { id, orderStatus } = req.body;
    await salesOrderModel.updateSalesOrderStatus({
      id,
      orderStatus
    });
    log.out('OK_SALESORDER_UPDATE-SALESORDER-STATUS', {
      req: { body: req.body, params: req.params },
      res: { message: `Successfully updated sales order status with id: ${id}` }
    });
    return res.json({
      message: `Successfully updated sales order status with id: ${id}`
    });
  } catch (error) {
    log.error('ERR_SALESORDER_UPDATE-SALESORDER-STATUS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const generateExcel = async (req, res) => {
  const { time_from, time_to } = req.body;
  const salesOrders = await salesOrderModel.getAllSalesOrdersWithTimeFilter({
    time_from: new Date(time_from),
    time_to: new Date(time_to)
  });
  await generateSalesOrderExcel({ salesOrders })
    .then((blob) => {
      const timeElapsed = Date.now();
      const today = new Date(timeElapsed);
      res.type(blob.type);
      blob.arrayBuffer().then((buf) => {
        res.setHeader(
          'Content-disposition',
          `attachment; filename = SalesOrder${format(today, 'yyyyMMdd')}.xlsx`
        );
        res.send(Buffer.from(buf));
      });
    })
    .catch((error) => {
      return res.status(400).json(error.message);
    });
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
    log.out('OK_SALESORDER_UPDATE-SALESORDER', {
      req: { body: req.body, params: req.params },
      res: { message: `Successfully updated sales order with id: ${id}` }
    });
    return res.json({ message: `Successfully updated sales order with id: ${id}` });
  } catch (error) {
    log.error('ERR_SALESORDER_UPDATE-SALESORDER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

exports.createSalesOrder = createSalesOrder;
exports.getAllSalesOrders = getAllSalesOrders;
exports.getAllSalesOrdersWithTimeFilter = getAllSalesOrdersWithTimeFilter;
exports.getSalesOrdersByDayWithTimeFilter = getSalesOrdersByDayWithTimeFilter;
exports.getRevenueByDayWithTimeFilter = getRevenueByDayWithTimeFilter;
exports.getBestSellerWithTimeFilter = getBestSellerWithTimeFilter;
exports.findSalesOrderById = findSalesOrderById;
exports.findSalesOrderByOrderId = findSalesOrderByOrderId;
exports.updateSalesOrder = updateSalesOrder;
exports.updateSalesOrderStatus = updateSalesOrderStatus;
exports.getOrdersByPlatformWithTimeFilter = getOrdersByPlatformWithTimeFilter;
exports.generateExcel = generateExcel;
exports.getBestSellerSalesOrderItemWithTimeFilter =
  getBestSellerSalesOrderItemWithTimeFilter;
exports.getSalesOfProductOverTimeWithTimeFilter =
  getSalesOfProductOverTimeWithTimeFilter;
exports.getAllSalesOrderItemsWithTimeFilter =
  getAllSalesOrderItemsWithTimeFilter;
exports.getAverageNumberofSalesOrdersWithTimeFilter =
  getAverageNumberofSalesOrdersWithTimeFilter;
exports.getAverageValueofSalesOrdersWithTimeFilter =
  getAverageValueofSalesOrdersWithTimeFilter;
