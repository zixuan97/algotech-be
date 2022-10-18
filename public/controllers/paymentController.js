const paymentModel = require('../models/paymentModel');
const bulkOrderModel = require('../models/bulkOrderModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
// const stripe = require('stripe')(process.env.STRIPE_API_KEY); //live
const stripe = require('stripe')(
  'sk_test_51LrBGjKgwBBPqmgaFEzCgBqD8OPqvLAeMq3UJsFmJrPQS3T2KJvPnBx007jiANN2Yn1sc37eqJ6OQUYb6XefpogS004C11Kb1r'
);
const payByStripeCreditCard = async (req, res) => {
  const { payeeEmail, amount, orderId } = req.body;
  const sessionURL = await paymentModel.payByStripePaynow({
    payeeEmail,
    amount,
    orderId
  });
  res.json(sessionURL);
};

const stripeWebhook = async (req, res) => {
  const payload = req.body;

  switch (payload.type) {
    case 'checkout.session.async_payment_succeeded': {
      const session = payload.data.object;
      const { orderId } = session.metadata;
      if (orderId) {
        await bulkOrderModel.updateBulkOrderStatusByOrderId({
          orderId,
          bulkOrderStatus: 'PAYMENT_SUCCESS'
        });
      }
      break;
    }

    case 'checkout.session.async_payment_failed': {
      const session = payload.data.object;
      const { orderId } = session.metadata;
      if (orderId) {
        await bulkOrderModel.updateBulkOrderStatusByOrderId({
          orderId,
          bulkOrderStatus: 'PAYMENT_FAILED'
        });
      }
      // Send an email to the customer asking them to retry their order

      break;
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

exports.payByStripeCreditCard = payByStripeCreditCard;
exports.stripeWebhook = stripeWebhook;
