const deliveryModel = require('../models/deliveryModel');
const salesOrderModel = require('../models/salesOrderModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { ShippingType, DeliveryMode, OrderStatus } = require('@prisma/client');
const shippitApi = require('../helpers/shippitApi');

const createDeliveryOrder = async (req, res) => {
  const { shippingType, courierType, shippingDate, deliveryDate, deliveryPersonnel, deliveryMode, carrier, parcelQty, parcelWeight, salesOrderId } = req.body;
  let salesOrder = await salesOrderModel.findSalesOrderById({ id: salesOrderId });
  const name = salesOrder.customerName.split(" ");
  let soShippit;
  if (shippingType === ShippingType.SHIPPIT) {
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
    shippingType,
    shippingDate,
    deliveryDate,
    deliveryPersonnel,
    shippitTrackingNum: shippingType === ShippingType.SHIPPIT ? soShippit.response.tracking_number : null,
    deliveryMode,
    carrier,
    salesOrderId
    })
  );
  await salesOrderModel.updateSalesOrderStatus({ id: salesOrder.id, orderStatus: OrderStatus.READY_FOR_DELIVERY });
  if (error) {
    log.error('ERR_DELIVERYORDER_CREATE-DO', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_DELIVERYORDER_CREATE-DO');
    const result = {
      id: data.id,
      shippingType,
      shippingDate,
      deliveryDate,
      deliveryPersonnel,
      deliveryMode,
      carrier,
      orderStatus: OrderStatus.READY_FOR_DELIVERY,
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
  const { id, shippingType, shippingDate, deliveryDate, deliveryPersonnel, deliveryMode, carrier, salesOrderId, orderStatus } = req.body;
  await salesOrderModel.updateSalesOrderStatus({ id: salesOrderId, orderStatus });
  const { data, error } = await common.awaitWrap(
    deliveryModel.updateDeliveryOrder({ id, shippingType, shippingDate, deliveryDate, deliveryPersonnel, deliveryMode, carrier })
  );
  if (error) {
    log.error('ERR_DELIVERY_UPDATE-DO', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_UPDATE-DO');
    const result = {
      id: data.id,
      shippingType,
      shippingDate,
      deliveryPersonnel,
      deliveryMode,
      orderStatus,
      carrier,
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
    await salesOrderModel.updateSalesOrderStatus({ id: deliveryOrder.salesOrderId, orderStatus: OrderStatus.CANCELLED });
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
        type: ShippingType.SHIPPIT,
        deliveryDate: d.scheduledDeliveryDate,
        deliveryPersonnel: "Shippit",
        deliveryMode: d.serviceLevel === "standard" ? DeliveryMode.STANDARD : DeliveryMode.EXPRESS,
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

const confirmShippitOrder = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const deliveryOrder = await deliveryModel.findDeliveryOrderByShippitTrackingNum({ trackingNumber });
    await deliveryModel.confirmShippitOrder({ trackingNumber });
    await salesOrderModel.updateSalesOrderStatus({ id: deliveryOrder.salesOrderId, orderStatus: OrderStatus.SHIPPED });
    log.out('OK_DELIVERY_CONFIRM-SHIPPIT-ORDER');
    res.json({ message: `Confirmed Shippit DeliveryOrder with tracking number:${trackingNumber}` });
  } catch (error) {
    log.error('ERR_DELIVERY_CONFIRM-SHIPPIT-ORDER', error.message);
    res.json(Error.http(error));
  }
};

const getShippitOrderLabel = async (req, res) => {
  const { trackingNumber } = req.params;
  const { data, error } = await common.awaitWrap(
    deliveryModel.getShippitOrderLabel({ trackingNumber })
  );
  if (error) {
    log.error('ERR_DELIVERY_GET-SHIPPIT-ORDER-LABEL', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-SHIPPIT-ORDER-LABEL');
    res.json(data);
  }
};

const bookShippitDelivery = async (req, res) => {
  const { trackingNumber } = req.params;
  try {
    let deliveryOrder = await deliveryModel.findDeliveryOrderByShippitTrackingNum({ trackingNumber });
    const deliveryBooking = await deliveryModel.bookShippitDelivery({ trackingNumber });
    await salesOrderModel.updateSalesOrderStatus({ id: deliveryOrder.salesOrderId, orderStatus: OrderStatus.DELIVERED });
    log.out('OK_DELIVERYORDER_BOOK-SHIPPIT-DELIVERY');
    res.json(deliveryBooking);
  } catch (error) {
    log.error('ERR_DELIVERYORDER_BOOK-SHIPPIT-DELIVERY', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
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
exports.confirmShippitOrder = confirmShippitOrder;
exports.getShippitOrderLabel = getShippitOrderLabel;
exports.bookShippitDelivery = bookShippitDelivery;
