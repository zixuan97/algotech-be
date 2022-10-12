const deliveryModel = require('../models/deliveryModel');
const salesOrderModel = require('../models/salesOrderModel');
const userModel = require('../models/userModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const {
  ShippingType,
  DeliveryMode,
  OrderStatus,
} = require('@prisma/client');
const shippitApi = require('../helpers/shippitApi');
const axios = require('axios');
const { generateDeliveryOrderPdfTemplate } = require('../helpers/pdf');
const { format } = require('date-fns');
const { prisma } = require('../models/index.js');
const lalamoveApi = require('../helpers/lalamoveApi');
const { json } = require('express');

const createManualDeliveryOrder = async (req, res) => {
  const {
    shippingType,
    shippingDate,
    deliveryDate,
    carrier,
    comments,
    eta,
    salesOrderId,
    assignedUserId
  } = req.body;
  let salesOrder = await salesOrderModel.findSalesOrderById({
    id: salesOrderId
  });
  let assignedUser = {};
  if (assignedUserId !== undefined) {
    assignedUser = await userModel.findUserById({ id: assignedUserId });
  }
  const { data, error } = await common.awaitWrap(
    deliveryModel.createDeliveryOrder({
      shippingType,
      shippingDate,
      deliveryDate,
      comments,
      eta,
      shippitTrackingNum: null,
      carrier,
      salesOrderId,
      assignedUserId
    })
  );
  await salesOrderModel.updateSalesOrderStatus({
    id: salesOrder.id,
    orderStatus: OrderStatus.READY_FOR_DELIVERY
  });
  if (error) {
    log.error('ERR_DELIVERYORDER_CREATE-MANUAL-DO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    const result = {
      id: data.id,
      shippingType,
      shippingDate,
      deliveryDate,
      eta,
      comments,
      carrier,
      orderStatus: OrderStatus.READY_FOR_DELIVERY,
      salesOrder,
      assignedUser
    };
    log.out('OK_DELIVERYORDER_CREATE-MANUAL-DO', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(result)
    });
    res.json(result);
  }
};

const createShippitDeliveryOrder = async (req, res) => {
  const {
    shippingType,
    courierType,
    shippingDate,
    deliveryDate,
    deliveryMode,
    carrier,
    comments,
    eta,
    parcelQty,
    parcelWeight,
    salesOrderId
  } = req.body;
  let salesOrder = await salesOrderModel.findSalesOrderById({
    id: salesOrderId
  });
  const soShippit = await deliveryModel.sendDeliveryOrderToShippit({
    courier_type: courierType,
    delivery_address: salesOrder.customerAddress,
    delivery_postcode: salesOrder.postalCode,
    delivery_state: 'Singapore',
    delivery_suburb: 'SG',
    courier_allocation: carrier,
    parcelQty,
    parcelWeight,
    email:
      salesOrder.customerEmail === null
        ? 'zac@thekettlegourmet.com'
        : salesOrder.customerEmail,
    first_name: salesOrder.customerName.split(' ')[0],
    last_name:
      salesOrder.customerName.split(' ')[1] === ''
        ? ''
        : salesOrder.customerName.split(' ')[1]
  });
  log.out('OK_DELIVERYORDER_CREATE-DO-SHIPPIT');
  const { data, error } = await common.awaitWrap(
    deliveryModel.createDeliveryOrder({
      shippingType,
      shippingDate,
      deliveryDate,
      comments,
      eta,
      shippitTrackingNum: soShippit.response.tracking_number,
      deliveryMode,
      carrier,
      salesOrderId
    })
  );
  if (error) {
    log.error('ERR_DELIVERYORDER_CREATE-DO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    await salesOrderModel.updateSalesOrderStatus({
      id: salesOrder.id,
      orderStatus: OrderStatus.READY_FOR_DELIVERY
    });
    try {
      await deliveryModel.updateDeliveryStatus({
        status: 'order_placed',
        statusOwner: '',
        date: new Date(Date.now()).toLocaleDateString(),
        timestamp: new Date(Date.now()).toLocaleTimeString('en-SG', {
          timeZone: 'Asia/Singapore'
        }),
        deliveryOrderId: data.id
      });
      const result = {
        id: data.id,
        shippingType,
        shippingDate,
        deliveryDate,
        deliveryMode,
        eta,
        comments,
        carrier,
        orderStatus: OrderStatus.READY_FOR_DELIVERY,
        trackingNumber: data.shippitTrackingNum,
        salesOrder,
        deliveryStatus: {
          status: 'order_placed',
          statusOwner: '',
          date: new Date(Date.now()).toLocaleDateString(),
          timestamp: new Date(Date.now()).toLocaleTimeString('en-SG', {
            timeZone: 'Asia/Singapore'
          }),
          deliveryOrderId: data.id
        }
      };
      log.out('OK_DELIVERYORDER_CREATE-DO', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(result)
      });
      res.json(result);
    } catch (error) {
      log.error('ERR_DELIVERYORDER_CREATE-DO', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    }
  }
};

const createLalamoveDeliveryOrder = async (req, res) => {
  const {
    shippingDate,
    deliveryDate,
    comments,
    eta,
    senderAddress,
    senderPostalCode,
    senderName,
    senderPhone,
    salesOrderId
  } = req.body;
  let salesOrder = await salesOrderModel.findSalesOrderById({
    id: salesOrderId
  });
  const senderLatLng = await deliveryModel.getLatLngFromPostalCode({ postalCode: senderPostalCode });
  const recipientLatLng = await deliveryModel.getLatLngFromPostalCode({ postalCode: salesOrder.postalCode });
  const customerPhone = salesOrder.customerContactNo.startsWith('+65') ? salesOrder.customerContactNo.replace(/\s/g, '') : `+65${salesOrder.customerContactNo.replace(/\s/g, '')}`
  const soLalamove = await lalamoveApi.placeLalamoveOrder({
    senderLat: senderLatLng.lat,
    senderLng: senderLatLng.lng,
    recipientLat: recipientLatLng.lat,
    recipientLng: recipientLatLng.lng,
    senderAddress,
    recipientAddress: salesOrder.customerAddress,
    senderName,
    senderPhone,
    recipientName: salesOrder.customerName,
    recipientPhone: customerPhone
  });
  log.out('OK_DELIVERYORDER_CREATE-DO-LALAMOVE');
  const { data, error } = await common.awaitWrap(
    deliveryModel.createDeliveryOrder({
      shippingType: ShippingType.LALAMOVE,
      shippingDate,
      deliveryDate,
      shippitTrackingNum: soLalamove.id,
      comments,
      eta,
      salesOrderId
    })
  );
  data.salesOrder = salesOrder;
  if (error) {
    log.error('ERR_DELIVERYORDER_CREATE-DO', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    await salesOrderModel.updateSalesOrderStatus({
      id: salesOrder.id,
      orderStatus: OrderStatus.READY_FOR_DELIVERY
    });
    try {
      await deliveryModel.updateDeliveryStatus({
        status: "order_placed",
        statusOwner: "",
        date: new Date(Date.now()).toLocaleDateString(),
        timestamp: new Date(Date.now()).toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore' }),
        deliveryOrderId: data.id
      });
      res.json(data);
      log.out('OK_DELIVERYORDER_CREATE-DO');
    } catch (error) {
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    }
  }
};

const getAllDeliveryOrders = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    deliveryModel.getAllDeliveryOrders({})
  );
  data.map((d) => {
    d.deliveryStatus =
      d.deliveryStatus.length !== 0
        ? d.deliveryStatus[d.deliveryStatus.length - 1]
        : {};
  });
  if (error) {
    log.error('ERR_DELIVERY_GET-ALL-DO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-ALL-DO', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getAllManualDeliveryOrders = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    deliveryModel.getAllManualDeliveryOrders({})
  );
  data.map((d) => {
    d.deliveryStatus = d.deliveryStatus.length !== 0 ? d.deliveryStatus[0] : {};
  });
  if (error) {
    log.error('ERR_DELIVERY_GET-ALL-MANUAL-DO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-ALL-MANUAL-DO', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getAllShippitDeliveryOrders = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    deliveryModel.getAllShippitDeliveryOrders({})
  );
  data.map((d) => {
    d.deliveryStatus =
      d.deliveryStatus.length !== 0
        ? d.deliveryStatus[d.deliveryStatus.length - 1]
        : {};
  });
  if (error) {;
    log.error('ERR_DELIVERY_GET-ALL-SHIPPIT-DO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-ALL-SHIPPIT-DO', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getAllLalamoveDeliveryOrders = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    deliveryModel.getAllLalamoveOrders({})
  );
  data.map(d => {
    d.deliveryStatus = d.deliveryStatus.length !== 0 ? d.deliveryStatus[d.deliveryStatus.length - 1] : {}
  });
  if (error) {
    log.error('ERR_DELIVERY_GET-ALL-LALAMOVE-DO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-ALL-LALAMOVE-DO', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getDeliveryOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryOrder = await deliveryModel.findDeliveryOrderById({ id });
    const result = {
      ...deliveryOrder,
      deliveryStatus:
        deliveryOrder.deliveryStatus.length !== 0
          ? deliveryOrder.deliveryStatus[
              deliveryOrder.deliveryStatus.length - 1
            ]
          : {}
    };
    log.out('OK_DELIVERY_GET-DO-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(result)
    });
    res.json(result);
  } catch (error) {
    log.error('ERR_DELIVERY_GET-DO-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error getting delivery order');
  }
};

const getDeliveryOrderByTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    await deliveryModel.fetchLatestStatusFromShippitAndAddToStatus({
      trackingNum: trackingNumber
    });
    const deliveryOrder = await deliveryModel.findDeliveryOrderByTrackingNumber(
      { trackingNumber }
    );
    const result = {
      ...deliveryOrder,
      deliveryStatus:
        deliveryOrder.deliveryStatus[deliveryOrder.deliveryStatus.length - 1]
    };
    log.out('OK_DELIVERY_GET-DO-BY-TRACKING-NUMBER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(result)
    });
    res.json(result);
  } catch (error) {
    log.error('ERR_DELIVERY_GET-DO-BY-TRACKING-NUMBER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error getting delivery order by tracking number');
  }
};

const getLalamoveOrderByDeliveryOrderId = async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryOrder = await deliveryModel.findDeliveryOrderById({ id });
    await lalamoveApi.fetchLatestStatusFromLalamoveAndAddToStatus({ orderId: deliveryOrder.shippitTrackingNum });
    const result = {
      ...deliveryOrder,
      deliveryStatus:
        deliveryOrder.deliveryStatus[deliveryOrder.deliveryStatus.length - 1]
    };
    log.out('OK_DELIVERY_GET-LALAMOVE-DO-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(result)
    });
    res.json(result);
  } catch (error) {
    log.error('ERR_DELIVERY_GET-LALAMOVE-DO-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error getting lalamove order by delivery order Id');
  }
};

const getDeliveryOrderBySalesOrderId = async (req, res) => {
  try {
    const { salesOrderId } = req.params;
    const deliveryOrder = await deliveryModel.findDeliveryOrderBySalesOrderId({
      salesOrderId
    });
    const result = {
      ...deliveryOrder,
      deliveryStatus:
        deliveryOrder.deliveryStatus[deliveryOrder.deliveryStatus.length - 1]
    };
    log.out('OK_DELIVERY_GET-DO-BY-SO-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(result)
    });
    res.json(result);
  } catch (error) {
    log.error('ERR_DELIVERY_GET-DO-BY-SO-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error getting delivery order by sales order Id');
  }
};

const findDeliveriesWithTimeAndTypeFilter = async (req, res) => {
  const { time_from, time_to, shippingType } = req.body;
  const { data, error } = await common.awaitWrap(
    deliveryModel.findDeliveriesWithTimeAndTypeFilter({
      time_from: new Date(time_from),
      time_to: new Date(time_to),
      shippingType
    })
  );
  let result = [];
  for (let d of data) {
    const salesOrder = await salesOrderModel.findSalesOrderById({
      id: d.salesOrderId
    });
    let assignedUser = {};
    if (d.assignedUserId !== null) {
      assignedUser = await userModel.findUserById({ id: d.assignedUserId });
    }
    const res = {
      id: d.id,
      shippingType: d.shippingType,
      shippingDate: d.shippingDate,
      deliveryDate: d.deliveryDate,
      deliveryMode: d.deliveryMode,
      comments: d.comments,
      eta: d.eta,
      carrier: d.carrier,
      salesOrder,
      assignedUser,
      deliveryStatus:
        d.deliveryStatus.length !== 0
          ? d.deliveryStatus[d.deliveryStatus.length - 1]
          : {}
    };
    result.push(res);
  }
  if (error) {
    log.error('ERR_DELIVERY_GET-DELIVERIES-TIME-TYPE-FILTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY-DELIVERIES-TIME-TYPE-FILTER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(result)
    });
    res.json(result);
  }
};

const updateDeliveryOrder = async (req, res) => {
  const {
    id,
    shippingType,
    shippingDate,
    deliveryDate,
    deliveryMode,
    carrier,
    comments,
    eta,
    salesOrderId,
    assignedUserId,
    orderStatus
  } = req.body;
  const salesOrder = await salesOrderModel.findSalesOrderById({
    id: salesOrderId
  });
  let assignedUser = {};
  if (assignedUserId !== undefined) {
    assignedUser = await userModel.findUserById({ id: assignedUserId });
  }
  await salesOrderModel.updateSalesOrderStatus({
    id: salesOrderId,
    orderStatus
  });
  const { data, error } = await common.awaitWrap(
    deliveryModel.updateDeliveryOrder({
      id,
      shippingType,
      shippingDate,
      deliveryDate,
      deliveryMode,
      carrier,
      comments,
      eta,
      assignedUserId
    })
  );
  if (error) {
    log.error('ERR_DELIVERY_UPDATE-DO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    data.salesOrder = salesOrder;
    data.assignedUser = assignedUser;
    log.out('OK_DELIVERY_UPDATE-DO', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const deleteDeliveryOrder = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(
    deliveryModel.deleteDeliveryOrder({ id })
  );
  if (error) {
    log.error('ERR_DELIVERY_DELETE-DO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_DELETE-DO', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted DeliveryOrder with id:${id}` }
    });
    res.json({ message: `Deleted DeliveryOrder with id:${id}` });
  }
};

const cancelManualDeliveryOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const deliveryOrder = await deliveryModel.findDeliveryOrderById({ id });
    await salesOrderModel.updateSalesOrderStatus({
      id: deliveryOrder.salesOrderId,
      orderStatus: OrderStatus.PREPARED
    });
    await deliveryModel.updateDeliveryStatus({
      status: 'cancelled',
      statusOwner: '',
      date: new Date(Date.now()).toLocaleDateString(),
      timestamp: new Date(Date.now()).toLocaleTimeString('en-SG', {
        timeZone: 'Asia/Singapore'
      }),
      deliveryOrderId: Number(id)
    });
    log.out('OK_DELIVERY_CANCEL-MANUAL-ORDER', {
      req: { body: req.body, params: req.params },
      res: { message: `Cancelled Manual DeliveryOrder with id:${id}` }
    });
    res.json({
      message: `Cancelled Manual DeliveryOrder with id:${id}`
    });
  } catch (error) {
    log.error('ERR_DELIVERY_CANCEL-MANUAL-ORDER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  }
};

const cancelShippitOrder = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const deliveryOrder = await deliveryModel.findDeliveryOrderByTrackingNumber(
      {
        trackingNumber
      }
    );
    await deliveryModel.cancelShippitOrder({ trackingNumber });
    deliveryModel.updateDeliveryStatus({
      status: 'cancelled',
      statusOwner: '',
      date: new Date(Date.now()).toLocaleDateString(),
      timestamp: new Date(Date.now()).toLocaleTimeString('en-SG', {
        timeZone: 'Asia/Singapore'
      }),
      deliveryOrderId: deliveryOrder.id
    });
    await salesOrderModel.updateSalesOrderStatus({
      id: deliveryOrder.salesOrderId,
      orderStatus: OrderStatus.PREPARED
    });
    log.out('OK_DELIVERY_CANCEL-SHIPPIT-ORDER', {
      req: { body: req.body, params: req.params },
      res: {message: `Cancelled Shippit DeliveryOrder with tracking number:${trackingNumber}`}
    });
    res.json({
      message: `Cancelled Shippit DeliveryOrder with tracking number:${trackingNumber}`
    });
  } catch (error) {
    log.error('ERR_DELIVERY_CANCEL-SHIPPIT-ORDER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error cancelling shippit order');
  }
};

const sendDeliveryOrderToShippit = async (req, res) => {
  const {
    courierType,
    deliveryAddress,
    deliveryPostcode,
    deliveryState,
    deliverySuburb,
    courierAllocation,
    parcelQty,
    parcelWeight,
    recipientEmail,
    firstName,
    lastName
  } = req.body;
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
    log.error('ERR_DELIVERY_SEND-DO-TO-SHIPPIT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_SEND-DO-TO-SHIPPIT', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data.response)
    });
    res.json(data.response);
  }
};

const trackShippitOrder = async (req, res) => {
  try {
    const { trackingNum } = req.params;
    const shippitOrder = await deliveryModel.trackShippitOrder({ trackingNum });
    log.out('OK_DELIVERY_TRACK-SHIPPIT-DO', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(shippitOrder)
    });
    res.json(shippitOrder);
  } catch (error) {
    log.error('ERR_DELIVERY_TRACK-SHIPPIT-DO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error tracking shippit order');
  }
};

const getLastestTrackingInfoOfOrder = async (req, res) => {
  try {
    const { trackingNum } = req.params;
    const shippitOrder = await deliveryModel.trackShippitOrder({ trackingNum });
    log.out('ERR_DELIVERY_GET_LATEST_INFO', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(shippitOrder.track[0])
    });
    res.json(shippitOrder.track[0]);
  } catch (error) {
    log.error('ERR_DELIVERY_GET_LATEST_INFO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error getting latest tracking info of order');
  }
};

const getAllShippitOrdersFromWebsite = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    deliveryModel.getAllDeliveryOrdersFromShippit({})
  );
  if (error) {
    log.error('ERR_DELIVERY_GET-ALL-DO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    let dataRes = [];
    for (let d of data) {
      const result = {
        shippitTrackingNum: d.trackingNumber,
        deliveryDate: d.scheduledDeliveryDate,
        comments: d.description,
        eta: d.estimatedDeliveryDatetime,
        deliveryMode:
          d.serviceLevel === 'standard'
            ? DeliveryMode.STANDARD
            : DeliveryMode.EXPRESS,
        shippingDate: d.scheduledDeliveryDate,
        shippingType: ShippingType.SHIPPIT,
        recipient: d.recipient,
        deliveryAddress: d.deliveryAddress
      };
      dataRes.push(result);
    }
    log.out('OK_DELIVERY_GET-ALL-DO', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(dataRes)
    });
    res.json(dataRes);
  }
};

const getToken = async (req, res) => {
  const { data, error } = await common.awaitWrap(shippitApi.getToken({}));
  if (error) {
    log.error('ERR_DELIVERY_GET-TOKEN', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-TOKEN', {
      req: { body: req.body, params: req.params },
      res: { token: data }
    });
    res.json({ token: data });
  }
};

const confirmShippitOrder = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const deliveryOrder = await deliveryModel.findDeliveryOrderByTrackingNumber(
      { trackingNumber }
    );
    await deliveryModel.confirmShippitOrder({ trackingNumber });
    await salesOrderModel.updateSalesOrderStatus({
      id: deliveryOrder.salesOrderId,
      orderStatus: OrderStatus.SHIPPED
    });
    await deliveryModel.updateDeliveryStatus({
      status: 'despatch_in_progress',
      statusOwner: '',
      date: new Date(Date.now()).toLocaleDateString(),
      timestamp: new Date(Date.now()).toLocaleTimeString('en-SG', {
        timeZone: 'Asia/Singapore'
      }),
      deliveryOrderId: deliveryOrder.id
    });
    log.out('OK_DELIVERY_CONFIRM-SHIPPIT-ORDER', {
      req: { body: req.body, params: req.params },
      res: {message: `Confirmed Shippit DeliveryOrder with tracking number:${trackingNumber}` }
    });
    res.json({
      message: `Confirmed Shippit DeliveryOrder with tracking number:${trackingNumber}`
    });
  } catch (error) {
    log.error('ERR_DELIVERY_CONFIRM-SHIPPIT-ORDER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  }
};

const getShippitOrderLabel = async (req, res) => {
  const { trackingNumber } = req.params;
  const { data, error } = await common.awaitWrap(
    deliveryModel.getShippitOrderLabel({ trackingNumber })
  );
  if (error) {
    log.error('ERR_DELIVERY_GET-SHIPPIT-ORDER-LABEL', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-SHIPPIT-ORDER-LABEL', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const bookShippitDelivery = async (req, res) => {
  const { trackingNumber } = req.params;
  try {
    let deliveryOrder = await deliveryModel.findDeliveryOrderByTrackingNumber({
      trackingNumber
    });
    const deliveryBooking = await deliveryModel.bookShippitDelivery({
      trackingNumber
    });
    await salesOrderModel.updateSalesOrderStatus({
      id: deliveryOrder.salesOrderId,
      orderStatus: OrderStatus.DELIVERED
    });
    deliveryModel.updateDeliveryStatus({
      status: 'ready_for_pickup',
      statusOwner: deliveryBooking[0].manifest_pdf,
      date: new Date(Date.now()).toLocaleDateString(),
      timestamp: new Date(Date.now()).toLocaleTimeString('en-SG', {
        timeZone: 'Asia/Singapore'
      }),
      deliveryOrderId: deliveryOrder.id
    });
    bookingManifestLabelLink = deliveryBooking.manifest_pdf;
    log.out('OK_DELIVERYORDER_BOOK-SHIPPIT-DELIVERY', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(deliveryBooking)
    });
    res.json(deliveryBooking);
  } catch (error) {
    log.error('ERR_DELIVERYORDER_BOOK-SHIPPIT-DELIVERY', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  }
};

const getBookingLabelLink = async (req, res) => {
  const { trackingNumber } = req.params;
  const deliveryOrder = await deliveryModel.findDeliveryOrderByTrackingNumber({
    trackingNumber
  });
  const deliveryBooking = await prisma.DeliveryStatus.findMany({
    where: {
      deliveryOrderId: deliveryOrder.id,
      status: 'ready_for_pickup'
    }
  });
  return res.json(deliveryBooking[0].statusOwner);
};

const getLatLong = async (req, res) => {
  const { time_from, time_to } = req.body;
  const salesOrders =
    await deliveryModel.findSalesOrderPostalCodeForManualDeliveriesWithTimeFilter(
      {
        time_from: new Date(time_from),
        time_to: new Date(time_to)
      }
    );
  let dataRes = [];
  Promise.allSettled(
    salesOrders.map(async (p) => {
      const url = `https://developers.onemap.sg/commonapi/search?searchVal=${p.postalCode}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
      return await axios
        .get(url)
        .then((response) => {
          log.out('OK_DELIVERY_GET-LAT-LONG');
          response.data.results[0].orders = p;
          dataRes.push(response.data.results[0]);
        })
        .catch((error) => {
          log.error('ERR_DELIVERY_GET-LAT-LONG', {
            err: error.message,
            req: { body: req.body, params: req.params }
          });
        });
    })
  ).then(() => res.json(dataRes));
};

const getLatLongForAssignedOrders = async (req, res) => {
  const { time_from, time_to, id } = req.body;
  const salesOrders =
    await deliveryModel.findSalesOrderPostalCodeForAssignedManualDeliveriesWithTimeFilter(
      {
        time_from: new Date(time_from),
        time_to: new Date(time_to),
        id
      }
    );
  let dataRes = [];
  Promise.allSettled(
    salesOrders.map(async (p) => {
      const url = `https://developers.onemap.sg/commonapi/search?searchVal=${p.postalCode}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
      return await axios
        .get(url)
        .then((response) => {
          log.out('OK_DELIVERY_GET-LAT-LONG');
          response.data.results[0].orders = p;
          dataRes.push(response.data.results[0]);
        })
        .catch((error) => {
          log.error('ERR_DELIVERY_GET-LAT-LONG', {
            err: error.message,
            req: { body: req.body, params: req.params }
          });
        });
    })
  ).then(() => res.json(dataRes));
};

const getLatLongForUnassignedOrders = async (req, res) => {
  const { time_from, time_to } = req.body;
  const salesOrders =
    await deliveryModel.findSalesOrderPostalCodeForUnassignedManualDeliveries({
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    });
  let dataRes = [];
  Promise.allSettled(
    salesOrders.map(async (p) => {
      const url = `https://developers.onemap.sg/commonapi/search?searchVal=${p.postalCode}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
      return await axios
        .get(url)
        .then((response) => {
          log.out('OK_DELIVERY_GET-LAT-LONG');
          response.data.results[0].orders = p;
          dataRes.push(response.data.results[0]);
        })
        .catch((error) => {
          log.error('ERR_DELIVERY_GET-LAT-LONG', {
            err: error.message,
            req: { body: req.body, params: req.params }
          });
        });
    })
  ).then(() => res.json(dataRes));
};

const getAllAssignedManualDeliveriesByUser = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await common.awaitWrap(
    deliveryModel.findAssignedManualDeliveriesByUser({ id })
  );
  data.map((d) => {
    d.deliveryStatus = d.deliveryStatus.length !== 0 ? d.deliveryStatus[0] : {};
  });
  if (error) {
    log.error('ERR_DELIVERY_GET-ALL-DO-ASSIGNED-TO-USER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-ALL-DO-ASSIGNED-TO-USER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getAllUnassignedManualDeliveries = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    deliveryModel.findAllUnassignedManualDeliveries({})
  );
  data.map((d) => {
    d.deliveryStatus = d.deliveryStatus.length !== 0 ? d.deliveryStatus[0] : {};
  });
  if (error) {
    log.error('ERR_DELIVERY_GET-ALL-UNASSIGNED-DELIVERIES', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-ALL-UNASSIGNED-DELIVERIES', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getAssignedManualDeliveriesByDate = async (req, res) => {
  const { time_from, time_to } = req.body;
  const { data, error } = await common.awaitWrap(
    deliveryModel.findAllAssignedManualDeliveriesByDate({
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    })
  );
  data.map((d) => {
    d.deliveryStatus = d.deliveryStatus.length !== 0 ? d.deliveryStatus[0] : {};
  });
  if (error) {
    log.error('ERR_DELIVERY_GET-ALL-ASSIGNED-MANUAL-DELIVERIES-BY-DATE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-ALL-ASSIGNED-MANUAL-DELIVERIES-BY-DATE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getAssignedManualDeliveriesByDateByUser = async (req, res) => {
  const { time_from, time_to, assignedUserId } = req.body;
  const { data, error } = await common.awaitWrap(
    deliveryModel.findAllAssignedManualDeliveriesByDateByUser({
      time_from: new Date(time_from),
      time_to: new Date(time_to),
      assignedUserId
    })
  );
  data.map((d) => {
    d.deliveryStatus = d.deliveryStatus.length !== 0 ? d.deliveryStatus[0] : {};
  });
  if (error) {
    log.error('ERR_DELIVERY_GET-ALL-ASSIGNED-MANUAL-DELIVERIES-BY-DATE-BY-USER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-ALL-ASSIGNED-MANUAL-DELIVERIES-BY-DATE-BY-USER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getUnassignedManualDeliveriesByDate = async (req, res) => {
  const { time_from, time_to } = req.body;
  const { data, error } = await common.awaitWrap(
    deliveryModel.findAllUnassignedManualDeliveriesByDate({
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    })
  );
  data.map((d) => {
    d.deliveryStatus = d.deliveryStatus.length !== 0 ? d.deliveryStatus[0] : {};
  });
  if (error) {
    log.error('ERR_DELIVERY_GET-ALL-UNASSIGNED-MANUAL-DELIVERIES-BY-DATE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-ALL-UNASSIGNED-MANUAL-DELIVERIES-BY-DATE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getCurrentLocationLatLong = async (req, res) => {
  const { address } = req.body;
  const url = `https://developers.onemap.sg/commonapi/search?returnGeom=Y&getAddrDetails=Y&pageNum=1&searchVal=${address}`;
  return await axios
    .get(url)
    .then((response) => {
      log.out('OK_DELIVERY_GET-CURRENT-LOCATION-LAT-LONG', {
        req: { body: req.body, params: req.params },
        res: response.data.results[0]
      });
      res.json(response.data.results[0]);
    })
    .catch((error) => {
      log.error('ERR_DELIVERY_GET-CURRENT-LOCATION-LAT-LONG', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    });
};

const getShippitOrdersByDate = async (req, res) => {
  const { time_from, time_to } = req.body;
  const { data, error } = await common.awaitWrap(
    deliveryModel.findAllShippitDeliveriesByDate({
      time_from: new Date(time_from),
      time_to: new Date(time_to)
    })
  );
  data.map((d) => {
    d.deliveryStatus =
      d.deliveryStatus.length !== 0
        ? d.deliveryStatus[d.deliveryStatus.length - 1]
        : {};
  });
  if (error) {
    log.error('ERR_DELIVERY_GET-ALL-SHIPPIT-DELIVERIES-BY-DATE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_DELIVERY_GET-ALL-SHIPPIT-DELIVERIES-BY-DATE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const generateDO = async (req, res) => {
  const doId = req.params;
  const deliveryOrder = await deliveryModel.findDeliveryOrderById(doId);
  const {
    id,
    createdAt,
    deliveryDate,
    shippingDate,
    carrier,
    comments,
    salesOrderId,
    deliveryMode,
    shippingType,
    assignedUserId
  } = deliveryOrder;
  const createdAtFormatted = format(createdAt, 'dd MMM yyyy');
  const shippingDateFormatted = format(deliveryDate, 'dd MMM yyyy');
  const salesOrder = await salesOrderModel.findSalesOrderById({
    id: salesOrderId
  });
  let assignedUser = {};
  if (assignedUserId !== null) {
    assignedUser = await userModel.findUserById({ id: assignedUserId });
  }
  await generateDeliveryOrderPdfTemplate({
    id,
    createdAtFormatted,
    shippingDateFormatted,
    carrier,
    comments,
    deliveryMode,
    shippingType,
    salesOrder,
    assignedUser
  })
    .then((pdfBuffer) => {
      res
        .writeHead(200, {
          'Content-Length': Buffer.byteLength(pdfBuffer),
          'Content-Type': 'application/pdf',
          'Content-disposition': 'attachment; filename = test.pdf'
        })
        .end(pdfBuffer);
    })
    .catch((error) => {
      log.error('ERR_PROCUREMENTORDER_GENERATE-DO-PDF', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      return res.status(error).json(error.message);
    });
};

const createLalamoveQuotation = async (req, res) => {
  const quote = await lalamoveApi.createQuotation({});
  return res.json(quote);
};

const placeLalamoveOrder = async (req, res) => {
  const order = await lalamoveApi.placeLalamoveOrder({});
  return res.json(order);
};

const getLalamoveOrderByLalamoveOrderId = async (req, res) => {
  const { id } = req.params;
  const order = await lalamoveApi.getLalamoveOrder({ id });
  res.json(order);
};

const cancelLalamoveOrder = async (req, res) => {
  const { id } = req.params;
  await lalamoveApi.cancelLalamoveOrder({ id });
  return res.json({ message: `Successfully cancelled Lalamove order with order id: ${id}` });
};

const getDriverDetails = async (req, res) => {
  const { orderId } = req.params;
  const driver = await lalamoveApi.getDriverDetails({ orderId });
  console.log(driver)
  return res.json(driver);
};

exports.createManualDeliveryOrder = createManualDeliveryOrder;
exports.createShippitDeliveryOrder = createShippitDeliveryOrder;
exports.createLalamoveDeliveryOrder = createLalamoveDeliveryOrder;
exports.getAllDeliveryOrders = getAllDeliveryOrders;
exports.getAllManualDeliveryOrders = getAllManualDeliveryOrders;
exports.getAllShippitDeliveryOrders = getAllShippitDeliveryOrders;
exports.getAllLalamoveDeliveryOrders = getAllLalamoveDeliveryOrders;
exports.updateDeliveryOrder = updateDeliveryOrder;
exports.deleteDeliveryOrder = deleteDeliveryOrder;
exports.getDeliveryOrder = getDeliveryOrder;
exports.getDeliveryOrderBySalesOrderId = getDeliveryOrderBySalesOrderId;
exports.sendDeliveryOrderToShippit = sendDeliveryOrderToShippit;
exports.trackShippitOrder = trackShippitOrder;
exports.getLastestTrackingInfoOfOrder = getLastestTrackingInfoOfOrder;
exports.getAllShippitOrdersFromWebsite = getAllShippitOrdersFromWebsite;
exports.getToken = getToken;
exports.cancelManualDeliveryOrder = cancelManualDeliveryOrder;
exports.cancelShippitOrder = cancelShippitOrder;
exports.confirmShippitOrder = confirmShippitOrder;
exports.getShippitOrderLabel = getShippitOrderLabel;
exports.bookShippitDelivery = bookShippitDelivery;
exports.getLatLong = getLatLong;
exports.findDeliveriesWithTimeAndTypeFilter =
  findDeliveriesWithTimeAndTypeFilter;
exports.generateDO = generateDO;
exports.getAllAssignedManualDeliveriesByUser =
  getAllAssignedManualDeliveriesByUser;
exports.getCurrentLocationLatLong = getCurrentLocationLatLong;
exports.getAllUnassignedManualDeliveries = getAllUnassignedManualDeliveries;
exports.getDeliveryOrderByTrackingNumber = getDeliveryOrderByTrackingNumber;
exports.getLatLongForUnassignedOrders = getLatLongForUnassignedOrders;
exports.getLatLongForAssignedOrders = getLatLongForAssignedOrders;
exports.getBookingLabelLink = getBookingLabelLink;
exports.getAssignedManualDeliveriesByDate = getAssignedManualDeliveriesByDate;
exports.getUnassignedManualDeliveriesByDate =
  getUnassignedManualDeliveriesByDate;
exports.getAssignedManualDeliveriesByDateByUser =
  getAssignedManualDeliveriesByDateByUser;
exports.getShippitOrdersByDate = getShippitOrdersByDate;
exports.createLalamoveQuotation = createLalamoveQuotation;
exports.placeLalamoveOrder = placeLalamoveOrder;
exports.getLalamoveOrderByLalamoveOrderId = getLalamoveOrderByLalamoveOrderId;
exports.cancelLalamoveOrder = cancelLalamoveOrder;
exports.getDriverDetails = getDriverDetails;
exports.getLalamoveOrderByDeliveryOrderId = getLalamoveOrderByDeliveryOrderId;
