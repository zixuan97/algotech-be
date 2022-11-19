const bulkOrderModel = require('../models/bulkOrderModel');
const paymentModel = require('../models/paymentModel');
const salesOrderModel = require('../models/salesOrderModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const bundleModel = require('../models/bundleModel');
const customerModel = require('../models/customerModel');
const { generateBulkOrderExcel } = require('../helpers/excel');
const { format } = require('date-fns');
const { uuid } = require('uuidv4');
const sns = require('../helpers/sns');
const { generateBulkOrderPDF } = require('../helpers/pdf');

const createBulkOrder = async (req, res) => {
  const {
    paymentMode,
    payeeName,
    payeeEmail,
    payeeRemarks,
    bulkOrderStatus,
    salesOrders,
    amount,
    transactionAmount,
    discountCode,
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
    totalSpent: transactionAmount,
    lastOrderDate: new Date(),
    daysSinceLastPurchase: 0
  });
  await Promise.all(
    await salesOrders.map(async (so) => {
      so.orderId = uuid();
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
      transactionAmount,
      discountCode,
      orderId
    })
  );

  if (error) {
    log.error('ERR_BULKORDER_CREATE-BO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    try {
      log.out('OK_BULKORDER_CREATE-BO', {
        req: { body: req.body, params: req.params },
        res: data
      });
      const {
        transactionAmount: amount,
        orderId,
        payeeEmail,
        discountCode
      } = data;
      if (paymentMode === 'CREDIT_CARD') {
        const sessionURL = await paymentModel.payByStripeCreditCard({
          amount,
          orderId,
          payeeEmail,
          discountCode
        });
        log.out('OK_BULKORDER_CREATE-CREDITCARD-PAYMENT-LINK', {
          req: { body: req.body, params: req.params },
          res: { paymentUrl: sessionURL, bulkOrder: JSON.stringify(data) }
        });
        return res.json({ paymentUrl: sessionURL, bulkOrder: data });
      } else {
        const sessionURL = await paymentModel.payByStripePaynow({
          amount,
          orderId,
          payeeEmail,
          discountCode
        });
        log.out('OK_BULKORDER_CREATE-PAYNOW-PAYMENT-LINK', {
          req: { body: req.body, params: req.params },
          res: { paymentUrl: sessionURL, bulkOrder: JSON.stringify(data) }
        });
        return res.json({ paymentUrl: sessionURL, bulkOrder: data });
      }
    } catch (error) {
      log.error('ERR_BULKORDER_CREATE-PAYMENT', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    }
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
    log.out('OK_BULKORDER_GET-ALL-BO', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const findBulkOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const bulkOrder = await bulkOrderModel.findBulkOrderById({ id });
    log.out('OK_BULKORDER_GET-BULKORDER-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(bulkOrder)
    });
    return res.json(bulkOrder);
  } catch (error) {
    log.error('ERR_BULKORDER_GET-BULKORDER-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
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
    return res.json(bulkOrder);
  } catch (error) {
    log.error('ERR_BULKORDER_GET-BULKORDER-BY-ORDER-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const findBulkOrderByEmail = async (req, res) => {
  try {
    const { payeeEmail } = req.params;
    const bulkOrder = await bulkOrderModel.findBulkOrderByEmail({ payeeEmail });
    log.out('OK_BULKORDER_GET-BULKORDER-BY-EMAIL', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(bulkOrder)
    });
    return res.json(bulkOrder);
  } catch (error) {
    log.error('ERR_BULKORDER_GET-BULKORDER-BY-EMAIL', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const getAllBulkOrdersWithTimeFilter = async (req, res) => {
  try {
    const { time_to, time_from } = req.body;
    const bulkOrders = await bulkOrderModel.getAllBulkOrdersWithTimeFilter({
      time_to,
      time_from
    });
    log.out('OK_BULKORDER_GET-BULKORDER-BY-TIMEFILTER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(bulkOrders)
    });
    return res.json(bulkOrders);
  } catch (error) {
    log.error('ERR_BULKORDER_GET-BULKORDER-BY-TIMEFILTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const updateBulkOrderStatus = async (req, res) => {
  try {
    const { id, bulkOrderStatus } = req.body;
    const bulkOrder = await bulkOrderModel.updateBulkOrderStatus({
      id,
      bulkOrderStatus
    });
    log.out('OK_BULKORDER_UPDATE-BULKORDER-STATUS', {
      req: { body: req.body, params: req.params },
      res: `Successfully updated bulk order with id: ${id}`
    });
    return res.json({
      message: `Successfully updated bulk order with id: ${id}`
    });
  } catch (error) {
    log.error('ERR_BULKORDER_GET-BULKORDER-BY-TIMEFILTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const massUpdateSalesOrderStatus = async (req, res) => {
  try {
    const { id, bulkOrderStatus, orderStatus } = req.body;
    const bulkOrder = await bulkOrderModel.findBulkOrderById({
      id
    });
    await Promise.all(
      bulkOrder.salesOrders.map(async (so) => {
        await salesOrderModel.updateSalesOrderStatus({
          id: so.id,
          orderStatus
        });
      })
    );
    await bulkOrderModel.updateBulkOrderStatus({
      id,
      bulkOrderStatus
    });
    log.out('OK_BULKORDER_UPDATE-SALESORDER-STATUS', {
      req: { body: req.body, params: req.params },
      res: `Successfully updated sales order status with bulk order id: ${id}`
    });

    if (orderStatus === 'PREPARED') {
      if (bulkOrder.payeeContactNo) {
        sns.sendOTP({
          number: bulkOrder.payeeContactNo,
          message: `Your order: ${bulkOrder.orderId} is being prepared and delivery is on the way to you soon!`
        });
      }
    }
    log.out('OK_BULKORDER_SALESORDER-STATUS-UPDATE-SMS', {
      req: { body: req.body, params: req.params },
      res: `Successfully sent sms for sales order status update`
    });
    return res.json({
      message: `Successfully updated sales order status with bulk order id: ${id}`
    });
  } catch (error) {
    log.error('ERR_BULKORDER_UPDATE-SALESORDER-STATUS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
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
      amount,
      transactionAmount,
      discountCode
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
      amount,
      transactionAmount,
      discountCode
    });
    log.out('OK_BULKORDER_UPDATE-BULKORDER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(bulkOrder)
    });
    return res.json(bulkOrder);
  } catch (error) {
    log.error('ERR_BULKORDER_UPDATE-BULKORDER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const generateExcel = async (req, res) => {
  const { payeeEmail } = req.body;
  const bulkOrders = await bulkOrderModel.findBulkOrderByEmail({
    payeeEmail
  });
  await generateBulkOrderExcel({ bulkOrders })
    .then((blob) => {
      const timeElapsed = Date.now();
      const today = new Date(timeElapsed);

      res.type(blob.type);

      blob.arrayBuffer().then((buf) => {
        res.setHeader(
          'Content-disposition',
          `attachment; filename = CustomerOrders${format(
            today,
            'yyyyMMdd'
          )}.xlsx`
        );
        res.send(Buffer.from(buf));
      });
    })
    .catch((error) => {
      return res.status(400).json(error.message);
    });
};

const generateBulkOrderSummaryPDF = async (req, res) => {
  const { id } = req.params;
  const bulkOrder = await bulkOrderModel.findBulkOrderById({ id });

  const createdDate = format(bulkOrder.createdTime, 'dd MMM yyyy');
  await generateBulkOrderPDF({
    bulkOrder,
    createdDate
  })
    .then((pdfBuffer) => {
      res
        .writeHead(200, {
          'Content-Length': Buffer.byteLength(pdfBuffer),
          'Content-Type': 'application/pdf',
          'Content-disposition': 'attachment; filename = test.pdf'
        })
        .end(pdfBuffer);
    })
    .catch((error) => {
      log.error('ERR_BULKORDER_GENERATE-BO-PDF', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      return res.status(400).json(error.message);
    });
};

exports.createBulkOrder = createBulkOrder;
exports.getAllBulkOrders = getAllBulkOrders;
exports.findBulkOrderById = findBulkOrderById;
exports.updateBulkOrder = updateBulkOrder;
exports.findBulkOrderByOrderId = findBulkOrderByOrderId;
exports.findBulkOrderByEmail = findBulkOrderByEmail;
exports.getAllBulkOrdersWithTimeFilter = getAllBulkOrdersWithTimeFilter;
exports.updateBulkOrderStatus = updateBulkOrderStatus;
exports.massUpdateSalesOrderStatus = massUpdateSalesOrderStatus;
exports.generateExcel = generateExcel;
exports.generateBulkOrderSummaryPDF = generateBulkOrderSummaryPDF;
