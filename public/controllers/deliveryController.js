const deliveryModel = require('../models/deliveryModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createDeliveryOrder = async (req, res) => {
  const { email, name, address } = req.body;
  const { error } = await common.awaitWrap(
    deliveryModel.createDeliveryOrder({
      email,
      name,
      address
    })
  );
  if (error) {
    log.error('ERR_DELIVERY_CREATE-DO', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_CREATE-DO');
    res.json({ message: 'DeliveryOrder created' });
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
  const { id, email, name, address } = req.body;
  const { error } = await common.awaitWrap(
    deliveryModel.updateDeliveryOrder({ id, email, name, address })
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
    log.error('OK_DELIVERY_GET-ALL-DO', error.message);
    res.json(Error.http(error));
  } else {
    log.out('ERR_DELIVERY_GET-ALL-DO');
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
