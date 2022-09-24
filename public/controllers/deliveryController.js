const deliveryModel = require('../models/deliveryModel');
const salesOrderModel = require('../models/salesOrderModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { DeliveryType, DeliveryMode, DeliveryStatus } = require('@prisma/client');
const shippitApi = require('../helpers/shippitApi');

const createDeliveryOrder = async (req, res) => {
  const { type, courierType, deliveryDate, deliveryPersonnel, method, carrier, status, parcelQty, parcelWeight, salesOrderId } = req.body;
  const salesOrder = await salesOrderModel.findSalesOrderById({ id: salesOrderId });
  const name = salesOrder.customerName.split(" ");
  let soShippit;
  // may need an additional field in salesOrder called 'deliveryAssigned' so that cannot have 2 delivery orders assigned to same sales order
  if (type === DeliveryType.SHIPPIT) {
    soShippit = await deliveryModel.sendDeliveryOrderToShippit({
      courier_type: courierType,
      delivery_address: salesOrder.customerAddress,
      delivery_postcode: salesOrder.postalCode,
      delivery_state: "Singapore",
      delivery_suburb: "SG",
      courier_allocation: carrier,
      parcelQty,
      parcelWeight,
      email: salesOrder.customerEmail === null ? "zac@thekettlegourmet.com" : salesOrder.customerEmail,
      first_name: name[0],
      last_name: name[1] === "" ? "" : name[1]
    });
    log.out('OK_DELIVERYORDER_CREATE-DO-SHIPPIT');
  }
  const { data, error } = await common.awaitWrap(
    deliveryModel.createDeliveryOrder({
    type,
    deliveryDate,
    deliveryPersonnel,
    shippitTrackingNum: type === DeliveryType.SHIPPIT ? soShippit.response.tracking_number : null,
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
      deliveryDate,
      deliveryPersonnel,
      method,
      carrier,
      status,
      salesOrderId,
      trackingNumber: data.shippitTrackingNum
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

const updateDeliveryOrder = async (req, res) => {
  const { id, type, deliveryDate, deliveryPersonnel, method, carrier, status, salesOrderId } = req.body;
  const { data, error } = await common.awaitWrap(
    deliveryModel.updateDeliveryOrder({ id, type, deliveryDate, deliveryPersonnel, method, carrier, status })
  );
  if (error) {
    log.error('ERR_DELIVERY_UPDATE-DO', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_UPDATE-DO');
    const result = {
      id: data.id,
      type,
      deliveryDate,
      deliveryPersonnel,
      method,
      carrier,
      status,
      salesOrderId
    };
    res.json(result);
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

const cancelShippitOrder = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const deliveryOrder = await deliveryModel.findDeliveryOrderByShippitTrackingNum({ trackingNumber });
    await deliveryModel.cancelShippitOrder({ trackingNumber });
    await deliveryModel.updateDeliveryOrder({ id: deliveryOrder.id, status: DeliveryStatus.CANCELLED });
    log.out('OK_DELIVERY_CANCEL-SHIPPIT-ORDER');
    res.json({ message: `Cancelled Shippit DeliveryOrder with tracking number:${trackingNumber}` });
  } catch (error) {
    log.error('ERR_DELIVERY_CANCEL-SHIPPIT-ORDER', error.message);
    res.status(500).send('Server Error');
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
    let dataRes = [];
    for (let d of data) {
      const result = {
        shippitTrackingNum: d.trackingNumber,
        type: DeliveryType.SHIPPIT,
        deliveryDate: d.scheduledDeliveryDate,
        deliveryPersonnel: "Shippit",
        method: d.serviceLevel === "standard" ? DeliveryMode.STANDARD : DeliveryMode.EXPRESS,
        recipient: d.recipient,
        deliveryAddress: d.deliveryAddress
      };
      dataRes.push(result);
    }
    log.out('OK_DELIVERY_GET-ALL-DO');
    res.json(dataRes);
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
    res.json({ "token" : data });
  }
};

exports.createDeliveryOrder = createDeliveryOrder;
exports.getAllDeliveryOrders = getAllDeliveryOrders;
exports.updateDeliveryOrder = updateDeliveryOrder;
exports.deleteDeliveryOrder = deleteDeliveryOrder;
exports.getDeliveryOrder = getDeliveryOrder;
exports.sendDeliveryOrderToShippit = sendDeliveryOrderToShippit;
exports.trackShippitOrder = trackShippitOrder;
exports.getLastestTrackingInfoOfOrder = getLastestTrackingInfoOfOrder;
exports.getAllShippitOrders = getAllShippitOrders;
exports.getToken = getToken;
exports.cancelShippitOrder = cancelShippitOrder;