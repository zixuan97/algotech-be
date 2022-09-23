const shopeeApi = require('../helpers/shopeeApi');
const salesOrderModel = require('../models/salesOrderModel');
const shopifyApi = require('../helpers/shopifyApi');
const keyModel = require('../models/keyModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createKey = async (req, res) => {
  const { key, value } = req.body;
  const { error } = await common.awaitWrap(keyModel.createKey({ key, value }));

  if (error) {
    log.error('ERR_SHOPEE_CREATE-KEY', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SHOPEE_CREATE-KEY');
    res.json({ message: `Created key with key:${key}` });
  }
};

const refreshToken = async (req, res) => {
  const { data: refresh_token, error } = await common.awaitWrap(
    keyModel.findKeyByName({ key: 'refresh_token' })
  );
  if (error) {
    log.error('ERR_SHOPEE_GET-REFRESH-KEY', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SHOPEE_GET-REFRESH-KEY');
    const response = await shopeeApi.refreshToken({
      refresh_token: refresh_token.value
    });
    try {
      await keyModel.updateKeys({
        key: 'access_token',
        value: response.access_token
      });
      await keyModel.updateKeys({
        key: 'refresh_token',
        value: response.refresh_token
      });
      res.json('Updated Shopee Keys');
    } catch (err) {
      log.error('ERR_SHOPEE_UPDATE-REFRESH-KEY', err.message);
      const e = Error.http(err);
      res.status(e.code).json(e.message);
    }
  }
};

const getAllOrders = async (req) => {
  const { time_from, time_to, page_size } = req;
  const { data: access_token, error } = await common.awaitWrap(
    keyModel.findKeyByName({ key: 'access_token' })
  );

  if (error) {
    log.error('ERR_GET-ALL-SHOPEE-ORDERS', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    try {
      const orderList = await shopeeApi.getAllOrders({
        access_token: access_token.value,
        time_from,
        time_to,
        page_size
      });
      const orderSN = orderList.response.order_list;

      const orders = await orderSN.map((order) => order.order_sn);
      const response = await shopeeApi.getOrderDetails({
        access_token: access_token.value,
        orders
      });
      log.out('OK_GET-ALL-SHOPEE-ORDERS');
      return response.response.order_list;
    } catch (err) {
      log.error('ERR_SHOPEE_GET-ALL-ORDERS', err.message);
    }
  }
};

const addShopeeOrders = async (req, res) => {
  const { time_from, time_to, page_size } = req.body;
  const epoch_time_from = Math.floor(new Date(time_from).getTime() / 1000);
  const epoch_time_to = Math.floor(new Date(time_to).getTime() / 1000);
  const data = await getAllOrders({
    time_from: epoch_time_from,
    time_to: epoch_time_to,
    page_size
  });
  if (data) {
    await Promise.allSettled(
      data.map(
        async (salesOrder) =>
          await salesOrderModel.createSalesOrder({
            orderId: salesOrder.order_sn,
            customerName: salesOrder.recipient_address.name,
            customerAddress: salesOrder.recipient_address.full_address,
            customerContactNo: salesOrder.recipient_address.phone,
            postalCode: salesOrder.recipient_address.zipcode,
            platformType: 'SHOPEE',
            createdTime: new Date(salesOrder.create_time * 1000),
            currency: salesOrder.currency,
            amount: salesOrder.total_amount,
            salesOrderItems: salesOrder.item_list.map((item) => {
              return {
                productName: item.item_name.replace(/ *\[[^\]]*]/g, ''),
                price: item.model_discounted_price,
                quantity: item.model_quantity_purchased
              };
            })
          })
      )
    );
    log.out('OK_ORDER_ADD-SHOPEE-ORDER');
    res.json({ message: 'Sales Orders for Shopee created', data });
  }
  else{
    log.error('ERR_ORDER_ADD-SHOPEE-ORDER');
  }
};

const getTrackingInfo = async (req, res) => {
  const { data: access_token, error } = await common.awaitWrap(
    keyModel.findKeyByName({ key: 'access_token' })
  );

  if (error) {
    log.error('ERR_SHOPEE_CREATE-KEY', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    try {
      const order = '220921CRN7HCJW';
      const response = await shopeeApi.getTrackingInfo({
        access_token: access_token.value,
        order
      });
      log.out('OK_SHOPEE_GET-TRACKING-INFO');
      res.json(response);
    } catch (err) {
      log.error('ERR_SHOPEE_GET-TRACKING-INFO', err.message);
      const e = Error.http(err);
      res.status(e.code).json(e.message);
    }
  }
};

const downloadShippingDocument = async (req, res) => {
  const { data: access_token, error } = await common.awaitWrap(
    keyModel.findKeyByName({ key: 'access_token' })
  );

  if (error) {
    log.error('ERR_SHOPEE_CREATE-KEY', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
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
      log.out('OK_SHOPEE_DOWNLOAD-SHIPPING-DOCUMENT');
      res.json(response);
    } catch (err) {
      log.error('ERR_SHOPEE_DOWNLOAD-SHIPPING-DOCUMENT', err.message);
      const e = Error.http(err);
      res.status(e.code).json(e.message);
    }
  }
};

exports.createKey = createKey;
exports.refreshToken = refreshToken;
exports.addShopeeOrders = addShopeeOrders;
exports.downloadShippingDocument = downloadShippingDocument;
exports.getTrackingInfo = getTrackingInfo;
