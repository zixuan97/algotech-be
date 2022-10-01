const { PrismaClient, ShippingType, DeliveryMode } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const shippitApi = require('../helpers/shippitApi');
const salesOrderModel = require('../models/salesOrderModel');
const { log } = require('../helpers/logger');

const createDeliveryOrder = async (req) => {
  const {
    shippingType,
    shippingDate,
    deliveryDate,
    shippitTrackingNum,
    deliveryMode,
    carrier,
    comments,
    eta,
    salesOrderId,
    assignedUserId
  } = req;
  return await prisma.DeliveryOrder.create({
    data: {
      deliveryDate,
      shippitTrackingNum,
      carrier,
      salesOrderId,
      deliveryMode,
      shippingDate,
      shippingType,
      assignedUserId,
      comments,
      eta
    }
  });
};

const getAllDeliveryOrders = async () => {
  const deliveryOrders = await prisma.DeliveryOrder.findMany({
    include: {
      salesOrder: true,
      assignedUser: true
    }
  });
  return deliveryOrders;
};

const getAllManualDeliveryOrders = async () => {
  const deliveryOrders = await prisma.DeliveryOrder.findMany({
    where: {
      shippingType: ShippingType.MANUAL
    },
    include: {
      salesOrder: true,
      assignedUser: true
    }
  });
  return deliveryOrders;
};

const getAllGrabDeliveryOrders = async () => {
  const deliveryOrders = await prisma.DeliveryOrder.findMany({
    where: {
      shippingType: ShippingType.GRAB
    },
    include: {
      salesOrder: true,
      assignedUser: true
    }
  });
  return deliveryOrders;
};

const getAllShippitDeliveryOrders = async () => {
  let filterOrders = [];
  const deliveryOrders = await prisma.DeliveryOrder.findMany({
    where: {
      shippingType: ShippingType.SHIPPIT
    },
    include: {
      salesOrder: true,
      assignedUser: true
    }
  });
  for (let dor of deliveryOrders) {
    let deliveryModeString = '';
    if (dor.deliveryMode === DeliveryMode.STANDARD) {
      deliveryModeString = 'STANDARD';
    } else if (dor.deliveryMode === DeliveryMode.EXPRESS) {
      deliveryModeString = 'EXPRESS';
    } else if (dor.deliveryMode === DeliveryMode.PRIORITY) {
      deliveryModeString = 'PRIORITY';
    }
    const data = {
      shippitTrackingNum: dor.shippitTrackingNum,
      deliveryDate: dor.deliveryDate,
      comments: dor.comments,
      eta: dor.eta,
      deliveryMode: deliveryModeString,
      shippingDate: dor.shippingDate,
      shippingType: ShippingType.SHIPPIT,
      recipient: {
        name: dor.salesOrder.customerName,
        email: dor.salesOrder.customerEmail,
        phone: dor.salesOrder.customerContactNo
      },
      deliveryAddress: {
        addressLine: dor.salesOrder.customerAddress,
        countryCode: 'SG',
        postcode: dor.salesOrder.postalCode,
        state: 'Singapore',
        suburb: 'Sg'
      }
    };
    filterOrders.push(data);
  }
  // const ordersFromShippitWebsite = await getAllDeliveryOrdersFromShippit({});
  // for (let d of ordersFromShippitWebsite) {
  //   const data = {
  //     shippitTrackingNum: d.trackingNumber,
  //     deliveryDate: d.scheduledDeliveryDate,
  //     comments: d.description,
  //     eta: d.estimatedDeliveryDatetime,
  //     deliveryMode: d.serviceLevel === "standard" ? DeliveryMode.STANDARD : DeliveryMode.EXPRESS,
  //     shippingDate: d.scheduledDeliveryDate,
  //     shippingType: ShippingType.SHIPPIT,
  //     recipient: d.recipient,
  //     deliveryAddress: d.deliveryAddress
  //   };
  //   filterOrders.push(data);
  // }
  return filterOrders;
};

const findDeliveryOrderById = async (req) => {
  const { id } = req;
  const deliveryOrder = await prisma.DeliveryOrder.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      salesOrder: true,
      assignedUser: true
    }
  });
  return deliveryOrder;
};

const findDeliveryOrderByTrackingNumber = async (req) => {
  const { trackingNumber } = req;
  const deliveryOrder = await prisma.DeliveryOrder.findMany({
    where: {
      shippitTrackingNum: trackingNumber
    },
    include: {
      salesOrder: true,
      assignedUser: true,
      deliveryStatus: true
    }
  });
  return deliveryOrder[0];
};

const findDeliveryOrderBySalesOrderId = async (req) => {
  const { salesOrderId } = req;
  const deliveryOrder = await prisma.DeliveryOrder.findMany({
    where: {
      salesOrderId: Number(salesOrderId)
    },
    include: {
      salesOrder: true,
      assignedUser: true,
      deliveryStatus: true
    }
  });
  return deliveryOrder[0];
};

const updateDeliveryOrder = async (req) => {
  const {
    id,
    shippingType,
    shippingDate,
    deliveryDate,
    deliveryMode,
    carrier,
    comments,
    eta,
    assignedUserId,
    deliveryStatus
  } = req;
  const deliveryOrder = await prisma.DeliveryOrder.update({
    where: { id },
    data: {
      shippingType,
      shippingDate,
      deliveryDate,
      deliveryMode,
      carrier,
      comments,
      eta,
      assignedUserId,
      deliveryStatus
    }
  });
  return deliveryOrder;
};

const findDeliveriesBasedOnTimeFilter = async (req) => {
  const { time_from, time_to } = req;
  const deliveryOrders =
    await prisma.$queryRaw`select "id" from "public"."DeliveryOrder" where "deliveryDate">=${time_from} and "deliveryDate"<=${time_to}`;
  return deliveryOrders;
};

const deleteDeliveryOrder = async (req) => {
  const { id } = req;
  await prisma.DeliveryOrder.delete({
    where: {
      id: Number(id)
    }
  });
};

const sendDeliveryOrderToShippit = async (req) => {
  const {
    courier_type,
    delivery_address,
    delivery_postcode,
    delivery_state,
    delivery_suburb,
    courier_allocation,
    qty,
    weight,
    email,
    first_name,
    last_name
  } = req;
  const data = JSON.stringify({
    order: {
      courier_type,
      delivery_address,
      delivery_postcode,
      delivery_state,
      delivery_suburb,
      courier_allocation,
      parcel_attributes: [
        {
          qty,
          weight
        }
      ],
      user_attributes: {
        email,
        first_name,
        last_name
      }
    }
  });
  const path = 'https://app.staging.shippit.com/api/3/orders';
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      Authorization: process.env.SHIPPIT_API_KEY
    }
  };
  return await axios
    .post(path, data, options)
    .then((res) => {
      const response = res.data;
      return response;
    })
    .catch((err) => {
      log.error('ERR_SEND-SHIPPIT-ORDER', err.message);
      throw err;
    });
};

const trackShippitOrder = async (req) => {
  const { trackingNum } = req;
  const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
  await snooze(1000);
  const api_path = `https://app.staging.shippit.com/api/3/orders/${trackingNum}/tracking`;
  const options = {
    headers: {
      Authorization: process.env.SHIPPIT_API_KEY
    }
  };
  return await axios
    .get(api_path, options)
    .then((res) => {
      const response = res.data;
      return response.response;
    })
    .catch((err) => {
      log.error('ERR_TRACK-SHIPPIT-ORDER', err.message);
      throw err;
    });
};

const getAllDeliveryOrdersFromShippit = async () => {
  const api_path = 'https://app.staging.shippit.com/api/5/orders';
  const token = await shippitApi.getToken({});
  const headerToken = `Bearer ${token}`;
  const options = {
    headers: {
      Authorization: headerToken
    }
  };
  return await axios
    .get(api_path, options)
    .then((res) => {
      const response = res.data;
      return response.data;
    })
    .catch((err) => {
      log.error('ERR_GET-ALL-SHIPPIT-ORDER', err.message);
      throw err;
    });
};

const cancelShippitOrder = async (req) => {
  const { trackingNumber } = req;
  const api_path = `https://app.staging.shippit.com/api/3/orders/${trackingNumber}`;
  const options = {
    headers: {
      Authorization: process.env.SHIPPIT_API_KEY
    }
  };
  return await axios
    .delete(api_path, options)
    .then((res) => {
      const response = res.data;
      return response;
    })
    .catch((err) => {
      log.error('ERR_CANCEL-SHIPPIT-ORDER', err.message);
      throw err;
    });
};

// const confirmShippitOrder = async (req) => {
//   const { trackingNumber } = req;
//   const data = {};
//   const api_path = `https://app.staging.shippit.com/api/5/orders/${trackingNumber}/confirm`;
//   const token = await shippitApi.getToken({});
//   const headerToken = `Bearer ${token}`;
//   const options = {
//     headers: {
//       'Authorization': headerToken
//     },
//   };
//   return await axios
//     .put(api_path, data, options)
//     .then((res) => {
//       const response = res.data;
//       return response.response;
//     })
//     .catch((err) => {
//       log.error('ERR_CONFIRM-SHIPPIT-ORDER', err.message);
//       throw err;
//     });
// };

const confirmShippitOrder = async (req) => {
  const { trackingNumber } = req;
  const api_path = `https://app.staging.shippit.com/api/3/orders/${trackingNumber}/label`;
  const options = {
    headers: {
      Authorization: process.env.SHIPPIT_API_KEY
    }
  };
  return await axios
    .get(api_path, options)
    .then((res) => {
      const response = res.data;
      return response.response;
    })
    .catch((err) => {
      log.error('ERR_CONFIRM-SHIPPIT-ORDER', err.message);
      throw err;
    });
};

const getShippitOrderLabel = async (req) => {
  const { trackingNumber } = req;
  const api_path = `https://app.staging.shippit.com/api/3/orders/${trackingNumber}/label`;
  const options = {
    headers: {
      Authorization: process.env.SHIPPIT_API_KEY
    }
  };
  return await axios
    .get(api_path, options)
    .then((res) => {
      const response = res.data;
      return response.response.qualified_url;
    })
    .catch((err) => {
      log.error('ERR_GET-SHIPPIT-ORDER-LABEL', err.message);
      throw err;
    });
};

const bookShippitDelivery = async (req) => {
  const { trackingNumber } = req;
  const api_path = `https://app.staging.shippit.com/api/3/book`;
  const data = {
    orders: [trackingNumber]
  };
  const options = {
    headers: {
      Authorization: process.env.SHIPPIT_API_KEY
    }
  };
  return await axios
    .post(api_path, data, options)
    .then((res) => {
      const response = res.data;
      return response.response;
    })
    .catch((err) => {
      log.error('ERR_BOOK-SHIPPIT-DELIVERY', err.message);
      throw err;
    });
};

const findDeliveriesWithTimeAndTypeFilter = async (req) => {
  const { time_from, time_to, shippingType } = req;
  let enumShippingType = ShippingType.SHIPPIT;
  if (shippingType === 'MANUAL') {
    enumShippingType = ShippingType.MANUAL;
  } else if (shippingType === 'GRAB') {
    enumShippingType = ShippingType.GRAB;
  }
  const deliveryOrders =
    await prisma.$queryRaw`select * from "public"."DeliveryOrder" where "deliveryDate">=${time_from} and "deliveryDate"<=${time_to}`;
  const filteredDeliveryOrders = deliveryOrders.filter(
    (x) => x.shippingType === enumShippingType
  );
  return filteredDeliveryOrders;
};

const findSalesOrderPostalCodeForManualDeliveriesWithTimeFilter = async (
  req
) => {
  const { time_from, time_to } = req;
  const deliveryOrders =
    await prisma.$queryRaw`select "id", "shippingType", "salesOrderId" from "public"."DeliveryOrder" where "deliveryDate">=${time_from} and "deliveryDate"<=${time_to}`;
  let salesOrders = [];
  const filteredDeliveryOrders = deliveryOrders.filter(
    (x) => x.shippingType === ShippingType.MANUAL
  );
  for (let d of filteredDeliveryOrders) {
    const salesOrder = await salesOrderModel.findSalesOrderById({
      id: d.salesOrderId
    });
    salesOrders.push(salesOrder);
  }
  return salesOrders;
};

const findSalesOrderPostalCodeForAssignedManualDeliveriesWithTimeFilter =
  async (req) => {
    const { time_from, time_to, id } = req;
    const deliveryOrders =
      await prisma.$queryRaw`select "id", "shippingType", "salesOrderId","assignedUserId" from "public"."DeliveryOrder" where "deliveryDate">=${time_from} and "deliveryDate"<=${time_to}`;
    let salesOrders = [];
    const filteredDeliveryOrders = deliveryOrders.filter(
      (x) => x.shippingType === ShippingType.MANUAL && x.assignedUserId === id
    );
    for (let d of filteredDeliveryOrders) {
      const salesOrder = await salesOrderModel.findSalesOrderById({
        id: d.salesOrderId
      });
      salesOrders.push(salesOrder);
    }
    return salesOrders;
  };

const findSalesOrderPostalCodeForUnassignedManualDeliveries = async (req) => {
  const { time_from, time_to } = req;
  const deliveryOrders =
    await prisma.$queryRaw`select "id", "shippingType", "salesOrderId","assignedUserId" from "public"."DeliveryOrder" where "deliveryDate">=${time_from} and "deliveryDate"<=${time_to}`;
  let salesOrders = [];
  console.log(deliveryOrders);
  const filteredDeliveryOrders = deliveryOrders.filter(
    (x) => x.shippingType === ShippingType.MANUAL && x.assignedUserId === null
  );
  for (let d of filteredDeliveryOrders) {
    const salesOrder = await salesOrderModel.findSalesOrderById({
      id: d.salesOrderId
    });
    salesOrders.push(salesOrder);
  }
  return salesOrders;
};

const findAssignedManualDeliveriesByUser = async (req) => {
  const { id } = req;
  const deliveryOrders = await prisma.DeliveryOrder.findMany({
    where: {
      assignedUserId: Number(id),
      shippingType: ShippingType.MANUAL
    },
    include: {
      salesOrder: true,
      assignedUser: true
    }
  });
  return deliveryOrders;
};

const findAllUnassignedManualDeliveries = async () => {
  const deliveryOrders = await prisma.DeliveryOrder.findMany({
    where: {
      assignedUser: null,
      shippingType: ShippingType.MANUAL
    },
    include: {
      salesOrder: true,
      assignedUser: true
    }
  });
  return deliveryOrders;
};

const updateShippitStatus = async (req) => {
  const { status, statusOwner, date, timestamp, deliveryOrderId } = req;
  const withUpdatedDeliveryStatus = await prisma.DeliveryStatus.create({
    data: {
      status,
      statusOwner,
      date,
      timestamp,
      deliveryOrder: {
        connect: {
          id: deliveryOrderId
        }
      }
    }
  });
  return withUpdatedDeliveryStatus;
};

exports.createDeliveryOrder = createDeliveryOrder;
exports.getAllDeliveryOrders = getAllDeliveryOrders;
exports.getAllManualDeliveryOrders = getAllManualDeliveryOrders;
exports.getAllShippitDeliveryOrders = getAllShippitDeliveryOrders;
exports.getAllGrabDeliveryOrders = getAllGrabDeliveryOrders;
exports.getAllDeliveryOrdersFromShippit = getAllDeliveryOrdersFromShippit;
exports.updateDeliveryOrder = updateDeliveryOrder;
exports.deleteDeliveryOrder = deleteDeliveryOrder;
exports.findDeliveryOrderById = findDeliveryOrderById;
exports.findDeliveryOrderBySalesOrderId = findDeliveryOrderBySalesOrderId;
exports.sendDeliveryOrderToShippit = sendDeliveryOrderToShippit;
exports.trackShippitOrder = trackShippitOrder;
exports.cancelShippitOrder = cancelShippitOrder;
exports.confirmShippitOrder = confirmShippitOrder;
exports.getShippitOrderLabel = getShippitOrderLabel;
exports.bookShippitDelivery = bookShippitDelivery;
exports.findSalesOrderPostalCodeForManualDeliveriesWithTimeFilter =
  findSalesOrderPostalCodeForManualDeliveriesWithTimeFilter;
exports.findDeliveriesBasedOnTimeFilter = findDeliveriesBasedOnTimeFilter;
exports.findDeliveriesWithTimeAndTypeFilter =
  findDeliveriesWithTimeAndTypeFilter;
exports.findAssignedManualDeliveriesByUser = findAssignedManualDeliveriesByUser;
exports.findAllUnassignedManualDeliveries = findAllUnassignedManualDeliveries;
exports.findDeliveryOrderByTrackingNumber = findDeliveryOrderByTrackingNumber;
exports.updateShippitStatus = updateShippitStatus;
exports.findSalesOrderPostalCodeForUnassignedManualDeliveries =
  findSalesOrderPostalCodeForUnassignedManualDeliveries;
exports.findSalesOrderPostalCodeForAssignedManualDeliveriesWithTimeFilter =
  findSalesOrderPostalCodeForAssignedManualDeliveriesWithTimeFilter;
