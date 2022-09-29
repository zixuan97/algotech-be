const salesOrderModel = require('../models/salesOrderModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { generateSalesOrderExcel } = require('../helpers/excel');
const { format } = require('date-fns');
const productModel = require('../models/productModel');

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
    log.error('ERR_SALESORDER_GET-REVENUE-BY-DAY-TIMEFILTER', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SALESORDER_GET-REVENUE-BY-DAY-TIMEFILTER');
    res.json(
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
    log.error('ERR_SALESORDER_GET-BEST-SELLER-TIMEFILTER', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SALESORDER_GET-BEST-SELLER-TIMEFILTER');
    res.json(
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
    log.error(
      'ERR_SALESORDER_GET-ORDERS-BY-PLATFORM-TIMEFILTER',
      error.message
    );
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SALESORDER_GET-ORDERS-BY-PLATFORM-TIMEFILTER');
    res.json(
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
    await salesOrderModel.updateSalesOrderStatus({
      id,
      orderStatus
    });
    // if (orderStatus === 'DELIVERED') {
    //   const salesOrder = await salesOrderModel.findSalesOrderById({ id });
    //   salesOrder.map(async (so) => {
    //     so.salesOrderItems.map(async (soi) => {
    //       if (soi.salesOrderBundleItems.length === 0) {
    //         const pdt = await productModel.findProductByName({
    //           name: soi.productName
    //         });
    //         await stockQuantityModel.connectOrCreateStockQuantity({
    //           productId: pdt.id,
    //           productName: pdt.name,
    //           productSku: pdt.sku,
    //           locationId: location.id,
    //           quantity: p.quantity,
    //           locationName: po.warehouseName
    //         });
    //       }
    //     });
    //   });
    // }
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
exports.getBestSellerWithTimeFilter = getBestSellerWithTimeFilter;
exports.findSalesOrderById = findSalesOrderById;
exports.findSalesOrderByOrderId = findSalesOrderByOrderId;
exports.updateSalesOrder = updateSalesOrder;
exports.updateSalesOrderStatus = updateSalesOrderStatus;
exports.getOrdersByPlatformWithTimeFilter = getOrdersByPlatformWithTimeFilter;
exports.generateExcel = generateExcel;
