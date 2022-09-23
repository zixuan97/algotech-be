const deliveryModel = require('../models/deliveryModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { DeliveryType } = require('@prisma/client');
const shippitApi = require('../helpers/shippitApi');

const createDeliveryOrder = async (req, res) => {
  const { type, recipientEmail, deliveryDate, deliveryPersonnel, shippitTrackingNum, method, carrier, status, salesOrderId } = req;
  if (type === DeliveryType.SHIPPIT) {
    await deliveryModel.sendDeliveryOrderToShippit({
      courier_type: courierType,
      delivery_address, // take from sales
      delivery_postcode, // take from sales
      delivery_state: 'Singapore',
      delivery_suburb: 'SG',
      courier_allocation: carrier,
      qty,
      weight,
      email: recipientEmail,
      first_name, // take from order
      last_name // take from order
    });
    log.out('OK_DELIVERYORDER_CREATE-DO-SHIPPIT');
  }
  const { data, error } = await common.awaitWrap(
    deliveryModel.createDeliveryOrder({
    type,
    recipientEmail,
    deliveryDate,
    deliveryPersonnel,
    shippitTrackingNum,
    method,
    carrier,
    status,
    salesOrderId
    })
  );
  if (error) {
    log.error('ERR_DELIVERYORDER_CREATE-DO', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_DELIVERYORDER_CREATE-DO');
    const result = {
      id: data.id,
      type,
      recipientEmail,
      deliveryDate,
      deliveryPersonnel,
      shippitTrackingNum,
      method,
      carrier,
      status,
      salesOrderId // supposed to be sales order
    };
    res.json(result);
  }
};

const getAllDeliveryOrders = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    deliveryModel.getAllDeliveryOrders({})
  );

  if (error) {
    log.error('ERR_DELIVERY_GET-ALL-DO', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-ALL-DO');
    res.json(data);
  }
};

const getDeliveryOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryOrder = await deliveryModel.findDeliveryOrderById({ id });
    log.out('OK_DELIVERY_GET-DO-BY-ID');
    res.json(deliveryOrder);
  } catch (error) {
    log.error('ERR_DELIVERY_GET-DO', error.message);
    res.status(500).send('Server Error');
  }
};

const getDeliveryOrderByName = async (req, res) => {
  try {
    const { name } = req.body;
    const deliveryOrder = await deliveryModel.findDeliveryOrderByName({ name });
    log.out('OK_DELIVERY_GET-DO-BY-ID');
    res.json(deliveryOrder);
  } catch (error) {
    log.error('ERR_DELIVERY_GET-DO', error.message);
    res.status(500).send('Server Error');
  }
};

const updateDeliveryOrder = async (req, res) => {
  const { id, type, recipientEmail, deliveryDate, deliveryPersonnel, shippitTrackingNum, method, carrier, status, salesOrderId } = req.body;
  const { error } = await common.awaitWrap(
    deliveryModel.updateDeliveryOrder({ id, type, recipientEmail, deliveryDate, deliveryPersonnel, shippitTrackingNum, method, carrier, status, salesOrderId })
  );
  if (error) {
    log.error('ERR_DELIVERY_UPDATE-DO', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_UPDATE-DO');
    res.json({ message: `Updated DeliveryOrder with id:${id}` });
  }
};

const deleteDeliveryOrder = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(
    deliveryModel.deleteDeliveryOrder({ id })
  );
  if (error) {
    log.error('ERR_DELIVERY_DELETE-DO', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_DELETE-DO');
    res.json({ message: `Deleted DeliveryOrder with id:${id}` });
  }
};

const sendDeliveryOrderToShippit = async (req, res) => {
  const { courierType, deliveryAddress, deliveryPostcode, deliveryState, deliverySuburb, courierAllocation, parcelQty, parcelWeight, recipientEmail, firstName, lastName } = req.body;
  const { data, error } = await common.awaitWrap(
    deliveryModel.sendDeliveryOrderToShippit({
      courier_type: courierType,
      delivery_address: deliveryAddress,
      delivery_postcode: deliveryPostcode,
      delivery_state: deliveryState,
      delivery_suburb: deliverySuburb,
      courier_allocation: courierAllocation,
      qty: parcelQty,
      weight: parcelWeight,
      email: recipientEmail,
      first_name: firstName,
      last_name: lastName
    })
  );
  if (error) {
    log.error('ERR_DELIVERY_SEND-DO-TO-SHIPPIT', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_SEND-DO-TO-SHIPPIT');
    res.json(data.response);
  }
};

const trackShippitOrder = async (req, res) => {
  try {
    const { trackingNum } = req.params;
    const shippitOrder = await deliveryModel.trackShippitOrder({ trackingNum });
    log.out('OK_DELIVERY_TRACK-SHIPPIT-DO');
    res.json(shippitOrder);
  } catch (error) {
    log.error('ERR_DELIVERY_TRACK-SHIPPIT-DO', error.message);
    res.status(500).send('Server Error');
  }
};

const getLastestTrackingInfoOfOrder = async (req, res) => {
  try {
    const { trackingNum } = req.params;
    const shippitOrder = await deliveryModel.trackShippitOrder({ trackingNum });
    log.out('OK_DELIVERY_TRACK-SHIPPIT-DO');
    res.json(shippitOrder.track[0]);
  } catch (error) {
    log.error('ERR_DELIVERY_TRACK-SHIPPIT-DO', error.message);
    res.status(500).send('Server Error');
  }
};

const getAllShippitOrders = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    deliveryModel.getAllDeliveryOrdersFromShippit({})
  );
  if (error) {
    log.error('ERR_DELIVERY_GET-ALL-DO', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-ALL-DO');
    res.json(data);
  }
};

const getToken = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    shippitApi.getToken({})
  );
  if (error) {
    log.error('ERR_DELIVERY_GET-TOKEN', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-TOKEN');
    res.json(data);
  }
};

exports.createDeliveryOrder = createDeliveryOrder;
exports.getAllDeliveryOrders = getAllDeliveryOrders;
exports.updateDeliveryOrder = updateDeliveryOrder;
exports.deleteDeliveryOrder = deleteDeliveryOrder;
exports.getDeliveryOrder = getDeliveryOrder;
exports.getDeliveryOrderByName = getDeliveryOrderByName;
exports.sendDeliveryOrderToShippit = sendDeliveryOrderToShippit;
exports.trackShippitOrder = trackShippitOrder;
exports.getLastestTrackingInfoOfOrder = getLastestTrackingInfoOfOrder;
exports.getAllShippitOrders = getAllShippitOrders;
exports.getToken = getToken;
