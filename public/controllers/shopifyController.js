const shopifyApi = require('../helpers/shopifyApi');
const salesOrderModel = require('../models/salesOrderModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const addShopifyOrders = async (req, res) => {
  const { last_date, latestId, limit } = req.body;
  try {
    const data = await shopifyApi.getOrders({ last_date, latestId, limit });
    if (data) {
      Promise.allSettled(
        data.map(
          async (salesOrder) =>
            await salesOrderModel.createSalesOrder({
              orderId: salesOrder.id.toString(),
              customerName:
                salesOrder.customer.first_name + salesOrder.customer.last_name,
              customerAddress:
                salesOrder.customer.default_address.address1 +
                salesOrder.customer.default_address.address2,
              customerContactNo: salesOrder.customer.default_address.phone,
              customerEmail: salesOrder.contact_email,
              postalCode: salesOrder.customer.default_address.zip,
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
            })
        )
      );
    }
    log.out('OK_ORDER_GET-SHOPIFY-ORDER');
    res.json(data);
  } catch (err) {
    log.error('ERR_ORDER_GET-SHOPIFY-ORDER', err.message);
    res.status(400).json(err);
  }
};

exports.addShopifyOrders = addShopifyOrders;
