const paymentModel = require('../models/paymentModel');
const bulkOrderModel = require('../models/bulkOrderModel');
const salesOrderModel = require('../models/salesOrderModel');
const discountCodeModel = require('../models/discountCodeModel');
const { format } = require('date-fns');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const stripe = require('stripe')(process.env.STRIPE_API_KEY); //live
// const stripe = require('stripe')(
//   'sk_test_51LrBGjKgwBBPqmgaFEzCgBqD8OPqvLAeMq3UJsFmJrPQS3T2KJvPnBx007jiANN2Yn1sc37eqJ6OQUYb6XefpogS004C11Kb1r'
// );
const emailHelper = require('../helpers/email');
const { generateBulkOrderPDF } = require('../helpers/pdf');

const payByStripeCreditCard = async (req, res) => {
  const { amount, orderId } = req.body;
  const sessionURL = await paymentModel.payByStripePaynow({
    amount,
    orderId
  });
  return res.json(sessionURL);
};

const generatePaymentLink = async (req, res) => {
  const { paymentMode, orderId } = req.body;
  const bulkOrder = await bulkOrderModel.findBulkOrderByOrderId({ orderId });
  await bulkOrderModel.updateBulkOrderPaymentMode({ orderId, paymentMode });
  try {
    const paymentLink = await paymentModel.generatePaymentLink({
      paymentMode,
      amount: bulkOrder.amount,
      orderId,
      payeeEmail: bulkOrder.payeeEmail,
      discountCode: bulkOrder.discountCode
    });
    log.out('OK_PAYMENT_GENERATE-PAYMENT-LINK', {
      req: { body: req.body, params: req.params },
      res: paymentLink
    });
    return res.json(paymentLink.url);
  } catch (error) {
    log.error('ERR_PAYMENT_GENERATE-PAYMENT-LINK', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const stripeWebhook = async (req, res) => {
  const payload = req.body;
  const session = payload.data.object;
  const { orderId, payeeEmail, discountCode } = session.metadata;
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
        log.out('OK_BULKORDER_SENT-EMAIL');
        if (discountCode) {
          const code = await discountCodeModel.findDiscountCode({
            discountCode
          });
          // if one time code remove payeeEmail
          if (code?.endDate) {
            const index = code.customerEmails.indexOf(payeeEmail);
            if (index > -1) {
              // only splice array when item is found
              code.customerEmails.splice(index, 1); // 2nd parameter means remove one item only
            }
            discountCodeModel.updateDiscountCode(code);
            log.out('OK_DISCOUNTCODE_REDEEM-VOUCHER');
          }
        }
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
        log.out('OK_BULKORDER_SENT-EMAIL');
        if (discountCode) {
          const code = await discountCodeModel.findDiscountCode({
            discountCode
          });
          // if one time code remove payeeEmail
          if (code.endDate) {
            const index = code.customerEmails.indexOf(payeeEmail);
            if (index > -1) {
              // only splice array when item is found
              code.customerEmails.splice(index, 1); // 2nd parameter means remove one item only
            }
            discountCodeModel.updateDiscountCode(code);
            log.out('OK_DISCOUNTCODE_REDEEM-VOUCHER');
          }
        }
        log.out('OK_BULKORDER_UPDATE-BULKORDER-STATUS');
      }
      if (session.payment_link) {
        paymentModel.removePaymentLink({ paymentLinkId: session.payment_link });
        log.out('OK_PAYMENT_REMOVE-PAYMENT-LINK');
      }

      break;
  }

  // Return a 200 response to acknowledge receipt of the event
  return res.send();
};

const removePaymentLink = async (req, res) => {
  const { paymentLinkId } = req.body;

  await paymentModel.removePaymentLink({ paymentLinkId });
  return res.json('done');
};

const sendBulkOrderEmail = async (req) => {
  try {
    const { orderId } = req;
    const bulkOrder = await bulkOrderModel.findBulkOrderByOrderId({ orderId });
    const createdDate = format(bulkOrder.createdTime, 'dd MMM yyyy');
    await generateBulkOrderPDF({
      bulkOrder,
      createdDate
    }).then(async (pdfBuffer) => {
      const subject = `Order Summary ${createdDate}`;
      const content =
        'Thank you for ordering with The Kettle Gourmet. Please view attached order summary.';
      const recipientEmail = bulkOrder.payeeEmail;
      await emailHelper.sendEmailWithAttachment({
        recipientEmail,
        subject,
        content,
        data: pdfBuffer.toString('base64'),
        filename: 'ordersummary.pdf'
      });
      console.log('EMAIL SENT');
    });
  } catch (error) {
    log.error('ERR_BULKORDER_SEND-BULKORDER-EMAIL', error.message);
  }
};

exports.payByStripeCreditCard = payByStripeCreditCard;
exports.stripeWebhook = stripeWebhook;
exports.generatePaymentLink = generatePaymentLink;
exports.removePaymentLink = removePaymentLink;
