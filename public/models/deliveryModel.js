const { PrismaClient, DeliveryType } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const shippitApi = require('../helpers/shippitApi');

const createDeliveryOrder = async (req) => {
  const {
    type,
    recipientEmail,
    deliveryDate,
    deliveryPersonnel,
    shippitTrackingNum,
    method,
    carrier,
    status,
    salesOrderId
  } = req;
  return await prisma.DeliveryOrder.create({
    data: {
      type,
      recipientEmail,
      deliveryDate,
      deliveryPersonnel,
      shippitTrackingNum,
      method,
      carrier,
      status,
      salesOrderId
    }
  });
};

const getAllDeliveryOrders = async () => {
  const deliveryOrders = await prisma.DeliveryOrder.findMany({
    include: {
      salesOrder: true
    }
  });
  return deliveryOrders;
};

const findDeliveryOrderById = async (req) => {
  const { id } = req;
  const deliveryOrder = await prisma.DeliveryOrder.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      salesOrder: true
    }
  });
  return deliveryOrder;
};

const findDeliveryOrderByShippitTrackingNum = async (req) => {
  const { trackingNumber } = req;
  const deliveryOrder = await prisma.DeliveryOrder.findMany({
    where: {
      shippitTrackingNum: trackingNumber
    },
    include: {
      salesOrder: true
    }
  });
  return deliveryOrder[0];
};

const updateDeliveryOrder = async (req) => {
  const { id, type, deliveryDate, deliveryPersonnel, method, carrier, status } =
    req;
  const deliveryOrder = await prisma.DeliveryOrder.update({
    where: { id },
    data: {
      type,
      deliveryDate,
      deliveryPersonnel,
      method,
      carrier,
      status
    }
  });
  return deliveryOrder;
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
  const path = 'https://app.shippit.com/api/3/orders';
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      Authorization: 'Bearer 0plMDNxpYCU1o5WlhLw2BA'
    }
  };
  return await axios
    .post(path, data, options)
    .then((res) => {
      const response = res.data;
      return response;
    })
    .catch((err) => {
      console.log(err);
    });
};

const trackShippitOrder = async (req) => {
  const { trackingNum } = req;
  const api_path = `https://app.shippit.com/api/3/orders/${trackingNum}/tracking`;
  const options = {
    headers: {
      Authorization: 'Bearer 0plMDNxpYCU1o5WlhLw2BA'
    }
  };
  return await axios
    .get(api_path, options)
    .then((res) => {
      const response = res.data;
      return response.response;
    })
    .catch((err) => {
      console.log(err);
    });
};

const getAllDeliveryOrdersFromShippit = async () => {
  const api_path = 'https://app.shippit.com/api/5/orders';
  const token = await shippitApi.getToken({});
  const headerToken = 'Bearer ' + token;
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
      console.log(err);
    });
};

const cancelShippitOrder = async (req, res) => {
  const { trackingNumber } = req;
  const api_path = `https://app.shippit.com/api/3/orders/${trackingNumber}`;
  const options = {
    headers: {
      Authorization: 'Bearer 0plMDNxpYCU1o5WlhLw2BA'
    }
  };
  return await axios
    .delete(api_path, options)
    .then((res) => {
      const response = res.data;
      return response.response;
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.createDeliveryOrder = createDeliveryOrder;
exports.getAllDeliveryOrders = getAllDeliveryOrders;
exports.updateDeliveryOrder = updateDeliveryOrder;
exports.deleteDeliveryOrder = deleteDeliveryOrder;
exports.findDeliveryOrderById = findDeliveryOrderById;
exports.sendDeliveryOrderToShippit = sendDeliveryOrderToShippit;
exports.trackShippitOrder = trackShippitOrder;
exports.getAllDeliveryOrdersFromShippit = getAllDeliveryOrdersFromShippit;
exports.cancelShippitOrder = cancelShippitOrder;
exports.findDeliveryOrderByShippitTrackingNum =
  findDeliveryOrderByShippitTrackingNum;
