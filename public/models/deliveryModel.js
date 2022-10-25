const { ShippingType, DeliveryMode } = require('@prisma/client');
const { prisma } = require('./index.js');
const axios = require('axios');
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
      assignedUser: true,
      deliveryStatus: true
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
      assignedUser: true,
      deliveryStatus: true
    }
  });
  return deliveryOrders;
};

const getAllLalamoveOrders = async () => {
  const deliveryOrders = await prisma.DeliveryOrder.findMany({
    where: {
      shippingType: ShippingType.LALAMOVE
    },
    include: {
      salesOrder: true,
      assignedUser: true,
      deliveryStatus: true
    }
  });
  return deliveryOrders;
};

// const getAllShippitDeliveryOrders = async () => {
//   let filterOrders = [];
//   const deliveryOrders = await prisma.DeliveryOrder.findMany({
//     where: {
//       shippingType: ShippingType.SHIPPIT
//     },
//     include: {
//       salesOrder: true,
//       assignedUser: true,
//       deliveryStatus: true
//     }
//   });
//   for (let dor of deliveryOrders) {
//     let deliveryModeString = '';
//     if (dor.deliveryMode === DeliveryMode.STANDARD) {
//       deliveryModeString = 'STANDARD';
//     } else if (dor.deliveryMode === DeliveryMode.EXPRESS) {
//       deliveryModeString = 'EXPRESS';
//     } else if (dor.deliveryMode === DeliveryMode.PRIORITY) {
//       deliveryModeString = 'PRIORITY';
//     }
//     const data = {
//       shippitTrackingNum: dor.shippitTrackingNum,
//       deliveryDate: dor.deliveryDate,
//       comments: dor.comments,
//       eta: dor.eta,
//       deliveryMode: deliveryModeString,
//       shippingDate: dor.shippingDate,
//       shippingType: ShippingType.SHIPPIT,
//       recipient: {
//         name: dor.salesOrder.customerName,
//         email: dor.salesOrder.customerEmail,
//         phone: dor.salesOrder.customerContactNo
//       },
//       deliveryAddress: {
//         addressLine: dor.salesOrder.customerAddress,
//         countryCode: 'SG',
//         postcode: dor.salesOrder.postalCode,
//         state: 'Singapore',
//         suburb: 'Sg'
//       },
//       deliveryStatus: dor.deliveryStatus
//     };
//     filterOrders.push(data);
//   }
//   return filterOrders;
// };

const findDeliveryOrderById = async (req) => {
  const { id } = req;
  const deliveryOrder = await prisma.DeliveryOrder.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      salesOrder: true,
      assignedUser: true,
      deliveryStatus: true
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

const findDeliveryOrderByLalamoveOrderId = async (req) => {
  const { orderId } = req;
  const deliveryOrder = await prisma.DeliveryOrder.findMany({
    where: {
      shippitTrackingNum: orderId
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
    deliveryStatus,
    salesOrderId
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
      deliveryStatus,
      salesOrderId
    }
  });
  return deliveryOrder;
};

const findDeliveriesBasedOnTimeFilter = async (req) => {
  const { time_from, time_to } = req;
  const deliveryOrders =
    await prisma.$queryRaw`select "id" from "public"."DeliveryOrder" where "deliveryDate">=${time_from} and "deliveryDate"<=${time_to}`;
  for (let d of deliveryOrders) {
    const deliveryStatus = await findDeliveryStatusByDeliveryOrderId({
      id: d.id
    });
    d.deliveryStatus = deliveryStatus;
  }
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

const fetchLatestStatusFromShippitAndAddToStatus = async (req) => {
  const { trackingNum } = req;
  const deliveryOrder = await findDeliveryOrderByTrackingNumber({
    trackingNumber: trackingNum
  });
  const trackingOrder = await trackShippitOrder({ trackingNum });
  const latestStatus = trackingOrder.track[0];
  const deliveryStatus = await prisma.DeliveryStatus.findMany({
    where: {
      deliveryOrderId: deliveryOrder.id,
      status: latestStatus.status
    }
  });
  if (deliveryStatus[0] === undefined) {
    await prisma.DeliveryStatus.create({
      data: {
        status: latestStatus.status,
        statusOwner: '',
        date: new Date(Date.now()).toLocaleDateString(),
        timestamp: new Date(Date.now()).toLocaleTimeString('en-SG', {
          timeZone: 'Asia/Singapore'
        }),
        deliveryOrder: {
          connect: {
            id: deliveryOrder.id
          }
        }
      }
    });
  }
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
  for (let d of filteredDeliveryOrders) {
    const deliveryStatus = await findDeliveryStatusByDeliveryOrderId({
      id: d.id
    });
    d.deliveryStatus = deliveryStatus;
  }
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

// const findAssignedManualDeliveriesByUser = async (req) => {
//   const { id } = req;
//   const deliveryOrders = await prisma.DeliveryOrder.findMany({
//     where: {
//       assignedUserId: Number(id),
//       shippingType: ShippingType.MANUAL
//     },
//     include: {
//       salesOrder: true,
//       assignedUser: true,
//       deliveryStatus: true
//     }
//   });
//   return deliveryOrders;
// };

// const findAllUnassignedManualDeliveries = async () => {
//   const deliveryOrders = await prisma.DeliveryOrder.findMany({
//     where: {
//       assignedUser: null,
//       shippingType: ShippingType.MANUAL
//     },
//     include: {
//       salesOrder: true,
//       assignedUser: true,
//       deliveryStatus: true
//     }
//   });
//   return deliveryOrders;
// };

// const findAllAssignedManualDeliveriesByDate = async (req) => {
//   const { time_from, time_to } = req;
//   const deliveryOrders =
//     await prisma.$queryRaw`select * from "public"."DeliveryOrder" where "deliveryDate">=${time_from} and "deliveryDate"<=${time_to}`;
//   const filteredDeliveryOrders = deliveryOrders.filter(
//     (x) => x.shippingType === ShippingType.MANUAL && x.assignedUserId !== null
//   );
//   for (let d of filteredDeliveryOrders) {
//     const salesOrder = await salesOrderModel.findSalesOrderById({
//       id: d.salesOrderId
//     });
//     const deliveryStatus = await findDeliveryStatusByDeliveryOrderId({
//       id: d.id
//     });
//     d.salesOrder = salesOrder;
//     d.deliveryStatus = deliveryStatus;
//   }
//   return filteredDeliveryOrders;
// };

const findDeliveryStatusByDeliveryOrderId = async (req) => {
  const { id } = req;
  const deliveryStatutes = await prisma.DeliveryStatus.findMany({
    where: {
      deliveryOrderId: id
    }
  });
  return deliveryStatutes;
};

const findAllAssignedManualDeliveriesByDateByUser = async (req) => {
  const { time_from, time_to, assignedUserId } = req;
  const deliveryOrders =
    await prisma.$queryRaw`select * from "public"."DeliveryOrder" where "deliveryDate">=${time_from} and "deliveryDate"<=${time_to}`;
  const filteredDeliveryOrders = deliveryOrders.filter(
    (x) =>
      x.shippingType === ShippingType.MANUAL &&
      x.assignedUserId === assignedUserId
  );
  for (let d of filteredDeliveryOrders) {
    const salesOrder = await salesOrderModel.findSalesOrderById({
      id: d.salesOrderId
    });
    const deliveryStatus = await findDeliveryStatusByDeliveryOrderId({
      id: d.id
    });
    d.salesOrder = salesOrder;
    d.deliveryStatus = deliveryStatus;
  }
  return filteredDeliveryOrders;
};

const findAllUnassignedManualDeliveriesByDate = async (req) => {
  const { time_from, time_to } = req;
  const deliveryOrders =
    await prisma.$queryRaw`select * from "public"."DeliveryOrder" where "deliveryDate">=${time_from} and "deliveryDate"<=${time_to}`;
  const filteredDeliveryOrders = deliveryOrders.filter(
    (x) => x.shippingType === ShippingType.MANUAL && x.assignedUserId === null
  );
  for (let d of filteredDeliveryOrders) {
    const salesOrder = await salesOrderModel.findSalesOrderById({
      id: d.salesOrderId
    });
    const deliveryStatus = await findDeliveryStatusByDeliveryOrderId({
      id: d.id
    });
    d.salesOrder = salesOrder;
    d.deliveryStatus = deliveryStatus;
  }
  return filteredDeliveryOrders;
};

const findAllShippitDeliveriesByDate = async (req) => {
  const { time_from, time_to } = req;
  const deliveryOrders =
    await prisma.$queryRaw`select * from "public"."DeliveryOrder" where "deliveryDate">=${time_from} and "deliveryDate"<=${time_to}`;
  const filteredDeliveryOrders = deliveryOrders.filter(
    (x) => x.shippingType === ShippingType.SHIPPIT
  );
  for (let d of filteredDeliveryOrders) {
    const salesOrder = await salesOrderModel.findSalesOrderById({
      id: d.salesOrderId
    });
    const deliveryStatus = await findDeliveryStatusByDeliveryOrderId({
      id: d.id
    });
    d.salesOrder = salesOrder;
    d.deliveryStatus = deliveryStatus;
  }
  return filteredDeliveryOrders;
};

const updateDeliveryStatus = async (req) => {
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

const getLatLngFromPostalCode = async (req) => {
  const { postalCode } = req;
  const url = `https://developers.onemap.sg/commonapi/search?searchVal=${postalCode}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
  return await axios
    .get(url)
    .then((response) => {
      log.out('OK_ONEMAP_GET-LAT-LONG');
      return {
        lat: response.data.results[0].LATITUDE,
        lng: response.data.results[0].LONGITUDE
      };
    })
    .catch((error) => {
      log.error('ERR_ONEMAP_GET-LAT-LONG', error.message);
    });
};

const findAllLalamoveDeliveriesByDate = async (req) => {
  const { time_from, time_to } = req;
  const deliveryOrders =
    await prisma.$queryRaw`select * from "public"."DeliveryOrder" where "deliveryDate">=${time_from} and "deliveryDate"<=${time_to}`;
  const filteredDeliveryOrders = deliveryOrders.filter(
    (x) => x.shippingType === ShippingType.LALAMOVE
  );
  for (let d of filteredDeliveryOrders) {
    const salesOrder = await salesOrderModel.findSalesOrderById({
      id: d.salesOrderId
    });
    const deliveryStatus = await findDeliveryStatusByDeliveryOrderId({
      id: d.id
    });
    d.salesOrder = salesOrder;
    d.deliveryStatus = deliveryStatus;
  }
  return filteredDeliveryOrders;
};

exports.createDeliveryOrder = createDeliveryOrder;
exports.getAllDeliveryOrders = getAllDeliveryOrders;
exports.getAllManualDeliveryOrders = getAllManualDeliveryOrders;
// exports.getAllShippitDeliveryOrders = getAllShippitDeliveryOrders;
exports.getAllLalamoveOrders = getAllLalamoveOrders;
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
// exports.findAssignedManualDeliveriesByUser = findAssignedManualDeliveriesByUser;
// exports.findAllUnassignedManualDeliveries = findAllUnassignedManualDeliveries;
exports.findDeliveryOrderByTrackingNumber = findDeliveryOrderByTrackingNumber;
exports.updateDeliveryStatus = updateDeliveryStatus;
exports.findSalesOrderPostalCodeForUnassignedManualDeliveries =
  findSalesOrderPostalCodeForUnassignedManualDeliveries;
exports.findSalesOrderPostalCodeForAssignedManualDeliveriesWithTimeFilter =
  findSalesOrderPostalCodeForAssignedManualDeliveriesWithTimeFilter;
exports.fetchLatestStatusFromShippitAndAddToStatus =
  fetchLatestStatusFromShippitAndAddToStatus;
// exports.findAllAssignedManualDeliveriesByDate = findAllAssignedManualDeliveriesByDate;
exports.findAllUnassignedManualDeliveriesByDate =
  findAllUnassignedManualDeliveriesByDate;
exports.findAllAssignedManualDeliveriesByDateByUser =
  findAllAssignedManualDeliveriesByDateByUser;
exports.findAllShippitDeliveriesByDate = findAllShippitDeliveriesByDate;
exports.findDeliveryStatusByDeliveryOrderId =
  findDeliveryStatusByDeliveryOrderId;
exports.getLatLngFromPostalCode = getLatLngFromPostalCode;
exports.findDeliveryOrderByLalamoveOrderId = findDeliveryOrderByLalamoveOrderId;
exports.findAllLalamoveDeliveriesByDate = findAllLalamoveDeliveriesByDate;
