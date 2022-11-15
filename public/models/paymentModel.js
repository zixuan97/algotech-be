// const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const stripe = require('stripe')(
  'sk_test_51LrBGjKgwBBPqmgaFEzCgBqD8OPqvLAeMq3UJsFmJrPQS3T2KJvPnBx007jiANN2Yn1sc37eqJ6OQUYb6XefpogS004C11Kb1r'
);
const payByStripeCreditCard = async (req) => {
  const domain =
    process.env.NODE_ENV === 'production'
      ? 'https://algotech-fe-b2b.vercel.app'
      : 'http://localhost:3002';

  const { amount, orderId, payeeEmail, discountCode } = req;
  const expiryDate = Date.now() + 3600 * 1000;
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'sgd',
          product_data: {
            name: orderId
          },
          unit_amount: (amount * 100).toFixed(0).toString().replace('.', '') // in stripe checkout format
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${domain}/bulkOrders/viewOrder?orderId=${orderId}&success=true`,
    cancel_url: `${domain}/bulkOrders/viewOrder?orderId=${orderId}&canceled=true`,
    metadata: { orderId, payeeEmail, discountCode }, // Store orderid and payee email in metadata
    expires_at: Math.floor(expiryDate / 1000)
  });

  return session.url;
};

const payByStripePaynow = async (req) => {
  const domain =
    process.env.NODE_ENV === 'production'
      ? 'https://algotech-fe-b2b.vercel.app'
      : 'http://localhost:3002';

  const { amount, orderId, payeeEmail, discountCode } = req;
  const expiryDate = Date.now() + 3600 * 1000;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['paynow'], // identify for paynow payment
    line_items: [
      {
        price_data: {
          currency: 'sgd',
          product_data: {
            name: orderId
          },
          unit_amount: (amount * 100).toFixed(0).toString().replace('.', '') // in stripe checkout format
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${domain}/bulkOrders/viewOrder?orderId=${orderId}&success=true`,
    cancel_url: `${domain}/bulkOrders/viewOrder?orderId=${orderId}&canceled=true`,
    metadata: { orderId, payeeEmail, discountCode }, // Store orderid and payee email in metadata
    expires_at: Math.floor(expiryDate / 1000)
  });

  return session.url;
};

const generatePaymentLink = async (req) => {
  const domain =
    process.env.NODE_ENV === 'production'
      ? 'https://algotech-fe-b2b.vercel.app'
      : 'http://localhost:3002';

  const { paymentMode, amount, orderId, payeeEmail, discountCode } = req;
  let payment_method_types = [];
  if (paymentMode === 'CREDIT_CARD') {
    payment_method_types.push('card');
  } else {
    payment_method_types.push('paynow');
  }
  const product = await stripe.products.create({
    name: orderId
  });

  const price = await stripe.prices.create({
    currency: 'sgd',
    unit_amount: (amount * 100).toFixed(0).toString().replace('.', ''),
    product: product.id
  });

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    after_completion: {
      type: 'redirect',
      redirect: {
        url: `${domain}/bulkOrders/viewOrder?orderId=${orderId}&success=true`
      }
    },
    payment_method_types,
    metadata: { orderId, payeeEmail, discountCode }
  });

  return paymentLink;
};

const removePaymentLink = async (req) => {
  const { paymentLinkId } = req;
  const items = await stripe.paymentLinks.listLineItems(paymentLinkId, {
    limit: 3
  });
  await stripe.prices.update(items.data[0].price.id, { active: false });
  await stripe.products.update(items.data[0].price.product, { active: false });

  return await stripe.paymentLinks.update(paymentLinkId, {
    active: false
  });
};

exports.payByStripeCreditCard = payByStripeCreditCard;
exports.payByStripePaynow = payByStripePaynow;
exports.generatePaymentLink = generatePaymentLink;
exports.removePaymentLink = removePaymentLink;
