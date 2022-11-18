const shopeeApi = require('../helpers/shopeeApi');
const salesOrderModel = require('../models/salesOrderModel');
const bundleModel = require('../models/bundleModel');
const keyModel = require('../models/keyModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createKey = async (req, res) => {
  const { key, value } = req.body;
  const { error } = await common.awaitWrap(keyModel.createKey({ key, value }));

  if (error) {
    log.error('ERR_SHOPEE_CREATE-KEY', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_SHOPEE_CREATE-KEY', {
      req: { body: req.body, params: req.params },
      res: { message: `Created key with key:${key}` }
    });
    return res.json({ message: `Created key with key:${key}` });
  }
};

const refreshToken = async (req, res) => {
  const { data: refresh_token, error } = await common.awaitWrap(
    keyModel.findKeyByName({ key: 'shopee_refresh_token' })
  );
  if (error) {
    log.error('ERR_SHOPEE_GET-REFRESH-KEY', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_SHOPEE_GET-REFRESH-KEY');
    const response = await shopeeApi.refreshToken({
      refresh_token: refresh_token.value
    });
    try {
      await keyModel.updateKeys({
        key: 'shopee_access_token',
        value: response.access_token
      });
      await keyModel.updateKeys({
        key: 'shopee_refresh_token',
        value: response.refresh_token
      });
      log.out('OK_SHOPEE_UPDATE-SHOPEE-KEY', {
        req: { body: req.body, params: req.params },
        res: { message: 'Updated Shopee Keys' }
      });
      return res.json({ message: 'Updated Shopee Keys' });
    } catch (err) {
      log.error('ERR_SHOPEE_UPDATE-REFRESH-KEY', {
        err: err.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(err);
      return res.status(e.code).json(e.message);
    }
  }
};

const getAllOrders = async (req) => {
  const { time_from, time_to, page_size } = req;
  const { data: access_token, error } = await common.awaitWrap(
    keyModel.findKeyByName({ key: 'shopee_access_token' })
  );

  if (error) {
    log.error('ERR_SHOPEE_GET-ALL-SHOPEE-ORDERS', error.message);
  } else {
    const orderList = await shopeeApi.getAllOrders({
      access_token: access_token.value,
      time_from,
      time_to,
      page_size
    });
    const orderSN = orderList.response.order_list;
    if (orderSN.length > 0) {
      const orders = await orderSN.map((order) => order.order_sn);
      const response = await shopeeApi.getOrderDetails({
        access_token: access_token.value,
        orders
      });
      log.out('OK_SHOPEE_GET-ALL-SHOPEE-ORDERS');
      return response.response.order_list;
    } else {
      return [];
    }
  }
};

const addShopeeOrders = async (req, res) => {
  const { time_from, time_to, page_size } = req.body;
  const epoch_time_from = Math.floor(new Date(time_from).getTime() / 1000);
  const epoch_time_to = Math.floor(new Date(time_to).getTime() / 1000);
  try {
    const data = await getAllOrders({
      time_from: epoch_time_from,
      time_to: epoch_time_to,
      page_size
    });

    if (data) {
      await Promise.all(
        data.map(async (salesOrder) => {
          const salesOrderDB = await salesOrderModel.findSalesOrderByOrderId({
            orderId: salesOrder.order_sn
          });
          if (!salesOrderDB) {
            return await salesOrderModel.createSalesOrder({
              orderId: salesOrder.order_sn,
              customerName: salesOrder.recipient_address.name,
              customerAddress: salesOrder.recipient_address.full_address,
              customerContactNo: salesOrder.recipient_address.phone,
              postalCode: salesOrder.recipient_address.zipcode,
              platformType: 'SHOPEE',
              createdTime: new Date(salesOrder.create_time * 1000),
              currency: salesOrder.currency,
              amount: salesOrder.total_amount,
              customerRemarks: salesOrder.message_to_seller,
              salesOrderItems: await Promise.all(
                salesOrder.item_list.map(async (item) => {
                  const bundle = await bundleModel.findBundleByName({
                    name: item.item_name.replace(/ *\[[^\]]*]/g, '')
                  });
                  let salesOrderBundleItems = [];
                  if (bundle) {
                    salesOrderBundleItems = bundle.bundleProduct;
                  }
                  return {
                    productName: item.item_name.replace(/ *\[[^\]]*]/g, ''),
                    price: item.model_discounted_price,
                    quantity: item.model_quantity_purchased,
                    salesOrderBundleItems
                  };
                })
              )
            });
          }
        })
      );
    }
    log.out('OK_SHOPEE-ADD-ORDERS', {
      req: { body: req.body, params: req.params },
      res: { message: 'Sales Orders for Shopee created' }
    });
    return res.json({ message: 'Sales Orders for Shopee created' });
  } catch (error) {
    log.error('ERR_SHOPEE-ADD-ORDERS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const getShopPerformance = async (req, res) => {
  const { data: access_token, error } = await common.awaitWrap(
    keyModel.findKeyByName({ key: 'shopee_access_token' })
  );

  if (error) {
    log.error('ERR_SHOPEE-GET-KEY', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    try {
      const response = await shopeeApi.getShopPerformance({
        access_token: access_token.value
      });
      const sellerPerformance = {
        overallPerformance: response.overall_performance,
        listingViolations: response.listing_violations,
        fulfilment: response.fulfillment,
        customerService: response.customer_service,
        customerSatisfaction: response.customer_satisfaction
      };
      log.out('OK_SHOPEE_GET-SHOP-PERFORMANCE', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(sellerPerformance)
      });
      return res.json(sellerPerformance);
    } catch (err) {
      log.error('ERR_SHOPEE_GET-SHOP-PERFORMANCE', {
        err: err.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(err);
      return res.status(e.code).json(e.message);
    }
  }
};

const downloadShippingDocument = async (req, res) => {
  const { data: access_token, error } = await common.awaitWrap(
    keyModel.findKeyByName({ key: 'shopee_access_token' })
  );

  if (error) {
    log.error('ERR_SHOPEE_CREATE-KEY', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    try {
      const order = '220921CRN7HCJW';
      const here = await shopeeApi.createShippingDocument({
        access_token: access_token.value,
        order
      });
      const response = await shopeeApi.downloadShippingDocument({
        access_token: access_token.value,
        order
      });
      log.out('OK_SHOPEE_DOWNLOAD-SHIPPING-DOCUMENT', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(response)
      });
      return res.json(response);
    } catch (err) {
      log.error('ERR_SHOPEE_DOWNLOAD-SHIPPING-DOCUMENT', {
        err: err.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(err);
      return res.status(e.code).json(e.message);
    }
  }
};

exports.createKey = createKey;
exports.refreshToken = refreshToken;
exports.addShopeeOrders = addShopeeOrders;
exports.downloadShippingDocument = downloadShippingDocument;
exports.getShopPerformance = getShopPerformance;
