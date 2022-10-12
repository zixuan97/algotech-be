const bulkOrderModel = require('../models/bulkOrderModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const bundleModel = require('../models/bundleModel');
const customerModel = require('../models/customerModel');

const createBulkOrder = async (req, res) => {
  const {
    paymentMode,
    payeeName,
    payeeEmail,
    payeeRemarks,
    bulkOrderStatus,
    salesOrders,
    amount,
    payeeContactNo,
    payeeCompany
  } = req.body;
  const orderId = new Date().getTime().toString();
  await customerModel.connectOrCreateCustomer({
    firstName: payeeName,
    lastName: '',
    email: payeeEmail,
    address: '',
    postalCode: '',
    contactNo: payeeContactNo,
    company: payeeCompany,
    totalSpent: amount,
    lastOrderDate: new Date()
  });
  await Promise.all(
    await salesOrders.map(async (so) => {
      so.orderId = Math.floor(new Date().getTime() / 1000).toString();
      so.createdTime = new Date();
      await Promise.all(
        so.salesOrderItems.map(async (item) => {
          const bundle = await bundleModel.findBundleByName({
            name: item.productName.replace(/ *\[[^\]]*]/g, '')
          });
          let salesOrderBundleItems = [];
          if (bundle) {
            salesOrderBundleItems = bundle.bundleProduct;
          }
          item.salesOrderBundleItems = salesOrderBundleItems;
        })
      );
    })
  );
  const { data, error } = await common.awaitWrap(
    bulkOrderModel.createBulkOrder({
      paymentMode,
      payeeName,
      payeeEmail,
      payeeRemarks,
      bulkOrderStatus,
      payeeContactNo,
      payeeCompany,
      salesOrders,
      amount,
      orderId
    })
  );

  if (error) {
    log.error('ERR_BULKORDER_CREATE-BO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_BULKORDER_CREATE-BO', {
      req: { body: req.body, params: req.params },
      res: data
    });
    res.json(data);
  }
};

const getAllBulkOrders = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    bulkOrderModel.getAllBulkOrders({})
  );

  if (error) {
    log.error('ERR_BULKORDER_GET-ALL-BO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
  }
  log.out('OK_BULKORDER_GET-ALL-BO', {
    req: { body: req.body, params: req.params },
    res: data
  });
  res.json(data);
};

const findBulkOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const bulkOrder = await bulkOrderModel.findBulkOrderById({ id });
    log.out('OK_BULKORDER_GET-BULKORDER-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(bulkOrder)
    });
    res.json(bulkOrder);
  } catch (error) {
    log.error('ERR_BULKORDER_GET-BULKORDER-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  }
};

const findBulkOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const bulkOrder = await bulkOrderModel.findBulkOrderByOrderId({ orderId });
    log.out('OK_BULKORDER_GET-BULKORDER-BY-ORDER-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(bulkOrder)
    });
    res.json(bulkOrder);
  } catch (error) {
    log.error('ERR_BULKORDER_GET-BULKORDER-BY-ORDER-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  }
};

const updateBulkOrder = async (req, res) => {
  try {
    const {
      id,
      paymentMode,
      payeeName,
      payeeEmail,
      payeeRemarks,
      bulkOrderStatus,
      salesOrders,
      payeeContactNo,
      payeeCompany,
      amount
    } = req.body;

    await Promise.all(
      await salesOrders.map(async (so) => {
        await Promise.all(
          so.salesOrderItems.map(async (item) => {
            const bundle = await bundleModel.findBundleByName({
              name: item.productName.replace(/ *\[[^\]]*]/g, '')
            });
            let salesOrderBundleItems = [];
            if (bundle) {
              salesOrderBundleItems = bundle.bundleProduct;
            }
            item.salesOrderBundleItems = salesOrderBundleItems;
          })
        );
      })
    );
    const bulkOrder = await bulkOrderModel.updateBulkOrder({
      id,
      paymentMode,
      payeeName,
      payeeEmail,
      payeeRemarks,
      bulkOrderStatus,
      salesOrders,
      payeeContactNo,
      payeeCompany,
      amount
    });
    log.out('OK_BULKORDER_UPDATE-BULKORDER', {
      req: { body: req.body, params: req.params },
      res: { message: `Successfully updated bulk order with id: ${id}` }
    });
    res.json({ message: `Successfully updated bulk order with id: ${id}` });
  } catch (error) {
    log.error('ERR_BULKORDER_UPDATE-BULKORDER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  }
};

exports.createBulkOrder = createBulkOrder;
exports.getAllBulkOrders = getAllBulkOrders;
exports.findBulkOrderById = findBulkOrderById;
exports.updateBulkOrder = updateBulkOrder;
exports.findBulkOrderByOrderId = findBulkOrderByOrderId;
