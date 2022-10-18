// const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const stripe = require('stripe')(
  'sk_test_51LrBGjKgwBBPqmgaFEzCgBqD8OPqvLAeMq3UJsFmJrPQS3T2KJvPnBx007jiANN2Yn1sc37eqJ6OQUYb6XefpogS004C11Kb1r'
);
const payByStripeCreditCard = async (req) => {
  const domain =
    process.env.NODE_ENV === 'production'
      ? 'https://algotech-fe-b2b.vercel.app'
      : 'http://localhost:3002';

  const { payeeEmail, amount, orderId } = req;
  const expiryDate = Date.now() + 3600 * 1000;
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'sgd',
          product_data: {
            name: payeeEmail
          },
          unit_amount: (amount * 100).toString().replace('.', '') // in stripe checkout format
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${domain}/bulkOrders/viewOrder?orderId=${orderId}?success=true`,
    cancel_url: `${domain}/bulkOrders/viewOrder?orderId=${orderId}?canceled=true`,
    metadata: { payeeEmail, orderId }, // Store orderid and payee email in metadata
    expires_at: Math.floor(expiryDate / 1000)
  });

  return session.url;
};

const payByStripePaynow = async (req) => {
  const domain =
    process.env.NODE_ENV === 'production'
      ? 'https://algotech-fe-b2b.vercel.app'
      : 'http://localhost:3002';

  const { payeeEmail, amount, orderId } = req;
  const expiryDate = Date.now() + 3600 * 1000;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['paynow'], // identify for paynow payment
    line_items: [
      {
        price_data: {
          currency: 'sgd',
          product_data: {
            name: payeeEmail
          },
          unit_amount: (amount * 100).toString().replace('.', '') // in stripe checkout format
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${domain}/bulkOrders/viewOrder?orderId=${orderId}?success=true`,
    cancel_url: `${domain}/bulkOrders/viewOrder?orderId=${orderId}?canceled=true`,
    metadata: { payeeEmail, orderId }, // Store orderid and payee email in metadata
    expires_at: Math.floor(expiryDate / 1000)
  });

  return session.url;
};

exports.payByStripeCreditCard = payByStripeCreditCard;
exports.payByStripePaynow = payByStripePaynow;
