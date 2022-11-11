const paymentModel = require('../models/paymentModel');
const bulkOrderModel = require('../models/bulkOrderModel');
const salesOrderModel = require('../models/salesOrderModel');
const { sendBulkOrderEmail } = require('./bulkOrderController');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
// const stripe = require('stripe')(process.env.STRIPE_API_KEY); //live
const stripe = require('stripe')(
  'sk_test_51LrBGjKgwBBPqmgaFEzCgBqD8OPqvLAeMq3UJsFmJrPQS3T2KJvPnBx007jiANN2Yn1sc37eqJ6OQUYb6XefpogS004C11Kb1r'
);
const payByStripeCreditCard = async (req, res) => {
  const { amount, orderId } = req.body;
  const sessionURL = await paymentModel.payByStripePaynow({
    amount,
    orderId
  });
  res.json(sessionURL);
};

const generatePaymentLink = async (req, res) => {
  const { paymentMode, orderId } = req.body;
  const bulkOrder = await bulkOrderModel.findBulkOrderByOrderId({ orderId });
  await bulkOrderModel.updateBulkOrderPaymentMode({ orderId, paymentMode });
  try {
    const paymentLink = await paymentModel.generatePaymentLink({
      paymentMode,
      amount: bulkOrder.amount,
      orderId
    });
    log.out('OK_PAYMENT_GENERATE-PAYMENT-LINK', {
      req: { body: req.body, params: req.params },
      res: paymentLink
    });
    res.json(paymentLink.url);
  } catch (error) {
    log.error('ERR_PAYMENT_GENERATE-PAYMENT-LINK', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  }
};

const stripeWebhook = async (req, res) => {
  const payload = req.body;
  const session = payload.data.object;
  const { orderId } = session.metadata;
  switch (payload.type) {
    case 'checkout.session.async_payment_succeeded':
    case 'checkout.session.completed':
      if (orderId) {
        const bulkOrder = await bulkOrderModel.updateBulkOrderStatusByOrderId({
          orderId,
          bulkOrderStatus: 'PAYMENT_SUCCESS'
        });

        await Promise.all(
          bulkOrder.salesOrders.map(async (so) => {
            await salesOrderModel.updateSalesOrderStatus({
              id: so.id,
              orderStatus: 'PAID'
            });
          })
        );

        log.out('OK_BULKORDER_UPDATE-BULKORDER-STATUS');

        await sendBulkOrderEmail({ orderId });
      }

      if (session.payment_link) {
        paymentModel.removePaymentLink({ paymentLinkId: session.payment_link });
        log.out('OK_PAYMENT_REMOVE-PAYMENT-LINK');
      }

      break;
    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired':
      if (session.payment_link) {
        paymentModel.removePaymentLink({ paymentLinkId: session.payment_link });
      }
      if (orderId) {
        await bulkOrderModel.updateBulkOrderStatusByOrderId({
          orderId,
          bulkOrderStatus: 'PAYMENT_FAILED'
        });

        await sendBulkOrderEmail({ orderId });
        log.out('OK_BULKORDER_UPDATE-BULKORDER-STATUS');
      }
      if (session.payment_link) {
        paymentModel.removePaymentLink({ paymentLinkId: session.payment_link });
        log.out('OK_PAYMENT_REMOVE-PAYMENT-LINK');
      }

      break;
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

const removePaymentLink = async (req, res) => {
  const { paymentLinkId } = req.body;

  await paymentModel.removePaymentLink({ paymentLinkId });
  res.json('done');
};

exports.payByStripeCreditCard = payByStripeCreditCard;
exports.stripeWebhook = stripeWebhook;
exports.generatePaymentLink = generatePaymentLink;
exports.removePaymentLink = removePaymentLink;
