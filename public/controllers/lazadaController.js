const lazadaApi = require('../helpers/lazadaApi');
const salesOrderModel = require('../models/salesOrderModel');
const keyModel = require('../models/keyModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const refreshToken = async (req, res) => {
  const { data: refresh_token, error } = await common.awaitWrap(
    keyModel.findKeyByName({ key: 'lazada_refresh_token' })
  );
  if (error) {
    log.error('ERR_LAZADA_GET-REFRESH-KEY', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_LAZADA_GET-REFRESH-KEY');
    const response = await lazadaApi.refreshToken({
      refresh_token: refresh_token.value
    });

    try {
      await keyModel.updateKeys({
        key: 'lazada_access_token',
        value: response.access_token
      });
      await keyModel.updateKeys({
        key: 'lazada_refresh_token',
        value: response.refresh_token
      });
      log.out('OK_LAZADA_UPDATE-LAZADA-KEY');
      res.json({ message: 'Updated Lazada Keys' });
    } catch (err) {
      log.error('ERR_LAZADA_UPDATE-LAZADA-KEY', err.message);
      const e = Error.http(err);
      res.status(e.code).json(e.message);
    }
  }
};

const addLazadaOrders = async (req, res) => {
  const { created_before, created_after, limit } = req.body;
  const { data: access_token, error } = await common.awaitWrap(
    keyModel.findKeyByName({ key: 'lazada_access_token' })
  );
  if (error) {
    log.error('ERR_LAZADA_GET-ACCESS-KEY', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_LAZADA_GET-ACCESS-KEY');
    const orderList = await lazadaApi.getOrderList({
      access_token: access_token.value,
      created_after,
      created_before,
      limit
    });
    log.out('OK_LAZADA_GET-ORDER-LIST');
    try {
      await Promise.all(
        orderList.map(async (salesOrder) => {
          const salesOrderDetails = await lazadaApi.getOrderItems({
            order_id: salesOrder.order_number.toString(),
            access_token: access_token.value
          });
          const salesOrderDB = await salesOrderModel.findSalesOrderByOrderId({
            orderId: salesOrder.order_number.toString()
          });
          if (!salesOrderDB) {
            return await salesOrderModel.createSalesOrder({
              orderId: salesOrder.order_number.toString(),
              customerName: salesOrder.address_shipping.first_name,
              customerAddress:
                salesOrder.address_shipping.address1 +
                salesOrder.address_shipping.address2 +
                salesOrder.address_shipping.address3,
              customerContactNo: salesOrder.address_shipping.phone,
              postalCode: salesOrder.address_shipping.post_code,
              platformType: 'LAZADA',
              createdTime: new Date(salesOrder.created_at),
              currency: 'SGD',
              amount: salesOrder.price,
              customerRemarks: salesOrder.remarks,
              salesOrderItems: salesOrderDetails.data.map((item) => {
                return {
                  productName: item.sku.replace(/ *\[[^\]]*]/g, ''),
                  price: item.item_price,
                  quantity: 1
                };
              })
            });
          }
        })
      );

      log.out('OK_LAZADA-ADD-ORDERS');
      res.json({ message: 'Sales Orders for Lazada created' });
    } catch (error) {
      log.error('ERR_LAZADA-ADD-ORDERS', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    }
  }
};

const getSellerPerformance = async (req, res) => {
  const { data: access_token, error } = await common.awaitWrap(
    keyModel.findKeyByName({ key: 'lazada_access_token' })
  );
  if (error) {
    log.error('ERR_LAZADA_GET-ACCESS-KEY', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_LAZADA_GET-ACCESS-KEY');
    const response = await lazadaApi.getSellerPerformance({
      access_token: access_token.value
    });
    res.json(response);
  }
};

exports.refreshToken = refreshToken;
exports.addLazadaOrders = addLazadaOrders;
exports.getSellerPerformance = getSellerPerformance;
