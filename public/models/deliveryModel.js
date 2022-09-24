const { PrismaClient, DeliveryType } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const shippitApi = require('../helpers/shippitApi');

const createDeliveryOrder = async (req) => {
  const { shippingType, recipientEmail, shippingDate, deliveryPersonnel, shippitTrackingNum, method, carrier, deliveryStatus, salesOrderId } = req;
  return await prisma.DeliveryOrder.create({
    data: {
      shippingType,
      recipientEmail,
      shippingDate,
      deliveryPersonnel,
      shippitTrackingNum,
      method,
      carrier,
      deliveryStatus,
      salesOrderId
    }
  })
};

const getAllDeliveryOrders = async () => {
  const deliveryOrders = await prisma.DeliveryOrder.findMany({});
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

const findDeliveryOrderByShippitTrackingNum = async (req) => {
  const { trackingNumber } = req;
  const deliveryOrder = await prisma.DeliveryOrder.findMany({
    where: {
      shippitTrackingNum: trackingNumber
    }
  });
  return deliveryOrder[0];
};

const updateDeliveryOrder = async (req) => {
  const { id, shippingType, shippingDate, deliveryPersonnel, method, carrier, deliveryStatus } = req;
  const deliveryOrder = await prisma.DeliveryOrder.update({
    where: { id },
    data: {
      shippingType,
      shippingDate,
      deliveryPersonnel,
      method,
      carrier,
      deliveryStatus
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
  const path = 'https://app.staging.shippit.com/api/3/orders';
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': process.env.SHIPPIT_API_KEY,
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
  const api_path = `https://app.staging.shippit.com/api/3/orders/${trackingNum}/tracking`;
  const options = {
    headers: {
      'Authorization': process.env.SHIPPIT_API_KEY
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
  const api_path = 'https://app.staging.shippit.com/api/5/orders';
  const token = await shippitApi.getToken({});
  const headerToken = `Bearer ${token}`;
  const options = {
    headers: {
      'Authorization': headerToken
    },
  };
  return await axios
    .get(api_path, options)
    .then((res) => {
      const response = res.data;
      console.log(response)
      return response.data;
    })
    .catch((err) => {
      console.log(err);
    });
};

const cancelShippitOrder = async (req, res) => {
  const { trackingNumber } = req;
  const api_path = `https://app.staging.shippit.com/api/3/orders/${trackingNumber}`;
  const options = {
    headers: {
      'Authorization': process.env.SHIPPIT_API_KEY
    },
  };
  return await axios
    .delete(api_path, options)
    .then((res) => {
      const response = res.data;
      return response;
    })
    .catch((err) => {
      console.log(err);
    });
};

const confirmShippitOrder = async (req, res) => {
  const { trackingNumber } = req;
  const data = {};
  const api_path = `https://app.staging.shippit.com/api/5/orders/${trackingNumber}/confirm`;
  const token = await shippitApi.getToken({});
  const headerToken = `Bearer ${token}`;
  const options = {
    headers: {
      'Authorization': headerToken
    },
  };
  return await axios
    .put(api_path, data, options)
    .then((res) => {
      const response = res.data;
      return response.response;
    })
    .catch((err) => {
      console.log(err);
    });
};

const getShippitOrderLabel = async (req, res) => {
  const { trackingNumber } = req;
  const api_path = `https://app.staging.shippit.com/api/3/orders/${trackingNumber}/label`;
  const options = {
    headers: {
      'Authorization': process.env.SHIPPIT_API_KEY
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

const bookShippitDelivery = async (req, res) => {
  const { trackingNumber } = req;
  const api_path = `https://app.staging.shippit.com/api/3/book`;
  const data = {
    orders: [
      trackingNumber
    ]
  }
  const options = {
    headers: {
      'Authorization': process.env.SHIPPIT_API_KEY
    },
  };
  return await axios
    .post(api_path, data, options)
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
exports.findDeliveryOrderByShippitTrackingNum = findDeliveryOrderByShippitTrackingNum;
exports.confirmShippitOrder = confirmShippitOrder;
exports.getShippitOrderLabel = getShippitOrderLabel;
exports.bookShippitDelivery = bookShippitDelivery;