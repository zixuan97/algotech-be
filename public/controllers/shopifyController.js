const shopifyApi = require('../helpers/shopifyApi');
const salesOrderModel = require('../models/salesOrderModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const CryptoJS = require('crypto-js');

const addShopifyOrders = async (req, res) => {
  const { last_date, latestId, limit } = req.body;
  try {
    const data = await shopifyApi.getOrders({ last_date, latestId, limit });
    if (data) {
      await Promise.all(
        data.map(async (salesOrder) => {
          const salesOrderDB = await salesOrderModel.findSalesOrderByOrderId({
            orderId: salesOrder.id.toString()
          });
          if (!salesOrderDB) {
            return await salesOrderModel.createSalesOrder({
              orderId: salesOrder.id.toString(),
              customerName:
                salesOrder.customer.first_name + salesOrder.customer.last_name,
              customerAddress:
                salesOrder.customer.default_address.address1 +
                salesOrder.customer.default_address.address2,
              customerContactNo: salesOrder.customer.default_address.phone,
              customerEmail: salesOrder.contact_email,
              postalCode: salesOrder.customer.default_address.zip,
              customerRemarks: salesOrder.note,
              platformType: 'SHOPIFY',
              createdTime: salesOrder.created_at,
              currency: salesOrder.currency,
              amount: salesOrder.current_total_price,
              salesOrderItems: salesOrder.line_items.map((item) => {
                return {
                  productName: item.name.replace(/ *\[[^\]]*]/g, ''),
                  price: item.price,
                  quantity: item.quantity
                };
              })
            });
          }
        })
      );
    }
    log.out('OK_SHOPIFY_GET-SHOPIFY-ORDER');
    res.json(data);
  } catch (error) {
    log.error('ERR_SHOPIFY-ADD-ORDERS', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  }
};

const verifyWebhook = (req) => {
  const { data, hmac_header } = req;
  const key = CryptoJS.enc.Utf8.parse(process.env.SHOPIFY_API_KEY);
  const msg = CryptoJS.enc.Utf8.parse(data);
  const token = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(msg, key));
  console.log('my signature', token);
  const hmac = CryptoJS.enc.Utf8.parse(hmac_header);
  console.log(hmac);
  return;
};

const createOrderWebhook = async (req) => {
  console.log('req' + req);
  log.out('test', req);
  const data = req.data;

  await verifyWebhook({ data, hmac_header: req.headers });
  const verified = console.log('here');
  console.log(data);
};

exports.addShopifyOrders = addShopifyOrders;
exports.createOrderWebhook = createOrderWebhook;
