const { PrismaClient, DeliveryType } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const shippitApi = require('../helpers/shippitApi');

const createDeliveryOrder = async (req) => {
  const { recipientEmail, deliveryDate, deliveryPersonnel, shippitTrackingNum, method, carrier, status, salesOrderId } = req;
  await prisma.DeliveryOrder.create({
    data: {
      type,
      recipientEmail,
      deliveryDate,
      deliveryPersonnel,
      shippitTrackingNum,
      method,
      carrier,
      status,
      salesOrderId // supposed to be salesOrder instead of id
    }
  })
};

const getAllDeliveryOrders = async () => {
  const manualOrders = await prisma.DeliveryOrder.findMany({
    where: {
      type: 'MANUAL',
    }
  });

  return deliveryOrders;
};

const findDeliveryOrderById = async (req) => {
  const { id } = req;

  const deliveryOrder = await prisma.DeliveryOrder.findUnique({
    where: {
      id: Number(id)
    }
  });
  return deliveryOrder;
};

const findDeliveryOrderByName = async (req) => {
  const { name } = req;
  const deliveryOrder = await prisma.DeliveryOrder.findUnique({
    where: {
      name
    }
  });
  return deliveryOrder;
};

const updateDeliveryOrder = async (req) => {
  const { id, email, name, address } = req;
  deliveryOrder = await prisma.DeliveryOrder.update({
    where: { id },
    data: {
      email,
      name,
      address
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
  const { courier_type, delivery_address, delivery_postcode, delivery_state, delivery_suburb, courier_allocation, qty, weight, email, first_name, last_name } = req;
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
  //const path = 'https://app.staging.shippit.com/api/3/orders';
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': 'Bearer 0plMDNxpYCU1o5WlhLw2BA',
    },
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
  const api_path = 'https://app.shippit.com/api/3/orders/' + trackingNum + '/tracking';
  const options = {
    headers: {
      'Authorization': 'Bearer 0plMDNxpYCU1o5WlhLw2BA'
    },
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
      'Authorization': headerToken
    },
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

exports.createDeliveryOrder = createDeliveryOrder;
exports.getAllDeliveryOrders = getAllDeliveryOrders;
exports.updateDeliveryOrder = updateDeliveryOrder;
exports.deleteDeliveryOrder = deleteDeliveryOrder;
exports.findDeliveryOrderById = findDeliveryOrderById;
exports.findDeliveryOrderByName = findDeliveryOrderByName;
exports.sendDeliveryOrderToShippit = sendDeliveryOrderToShippit;
exports.trackShippitOrder = trackShippitOrder;
exports.getAllDeliveryOrdersFromShippit = getAllDeliveryOrdersFromShippit;
