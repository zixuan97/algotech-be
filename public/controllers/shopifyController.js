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

  console.log(token === hmac_header);
  return token === hmac_header;
};
const clients = [];

const sendOrderWebhook = async (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Content-Encoding': 'none',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);
  setInterval(() => {
    log.out('writing data');
    res.write('event: message\n'); // message event
    res.write('data:' + JSON.stringify({ test: 'test1' }));
    res.write('\n\n');
    res.flush();
    res.send(200);
  }, 10000);

  // const clientId = Date.now();

  // const newClient = {
  //   id: clientId,
  //   res
  // };

  // clients.push(newClient);
  // log.out('New Client established', newClient.id);

  // req.on('close', () => {
  //   console.log(`${clientId} Connection closed`);
  //   clients = clients.filter((client) => client.id !== clientId);
  // });
};

const sendEventsToAll = (salesOrderData) => {
  clients.forEach((client) => {
    log.out('OK_SHOPIFY_WEBHOOK-SENT-ORDER');
    client.res.write(`data: ${JSON.stringify(salesOrderData)}\n\n`);
  });
};

const createOrderWebhook = async (req, res, next) => {
  const salesOrder = req.body;

  // const verified = verifyWebhook({
  //   salesOrder,
  //   hmac_header: req.headers['X-Shopify-Hmac-SHA256']
  // });
  try {
    const salesOrderDB = await salesOrderModel.findSalesOrderByOrderId({
      orderId: salesOrder.id.toString()
    });
    if (!salesOrderDB) {
      const salesOrderData = await salesOrderModel.createSalesOrder({
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
        amount: salesOrder.total_price,
        salesOrderItems: salesOrder.line_items.map((item) => {
          return {
            productName: item.name.replace(/ *\[[^\]]*]/g, ''),
            price: item.price,
            quantity: item.quantity
          };
        })
      });
      log.out('OK_SHOPIFY_ADD-ORDER-WEBHOOK');
      res.json({ message: 'order received' });

      // return sendEventsToAll(salesOrderData);
    } else {
      res.json({ message: 'order already exists' });
    }
  } catch (error) {
    log.error('ERR_SHOPIFY_ADD-ORDER-WEBHOOK', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  }
};

exports.addShopifyOrders = addShopifyOrders;
exports.createOrderWebhook = createOrderWebhook;
exports.sendOrderWebhook = sendOrderWebhook;
