const { PrismaClient, DeliveryType } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

// const createDeliveryOrder = async (req) => {
//   const { recipientEmail, deliveryDate, deliveryPersonnel, carrier, status, salesOrderId } = req;
//   await prisma.DeliveryOrder.create({
//     data: {
//       type: DeliveryType.MANUAL,
//       recipientEmail,
//       deliveryDate,
//       deliveryPersonnel,
//       carrier,
//       status,
//       salesOrderId
//     }
//   });
// };

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
  const options = {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJSUzUxMiJ9.eyJpc3MiOiJhcHAuc2hpcHBpdC5jb20iLCJzdWIiOiIyMTAyMjVmMy01ODk4LTRjMzctODNhNS1jODgyNzMzOTk4Y2IiLCJleHAiOjE2NjM4MzcyOTMsInVzZXIiOiIyMTAyMjVmMy01ODk4LTRjMzctODNhNS1jODgyNzMzOTk4Y2IiLCJlbWFpbCI6Im1lcnlsc2Vvd3dAZ21haWwuY29tIiwicm9sZXMiOlsibWVyY2hhbnQiXSwidmVyc2lvbiI6InYwLjEuMiIsImZwcl9oYXNoIjoiY2Q4MjgxOWNmOTkyZWIxZGY1MDVhODk4ZTlhMTRkOGVmY2U5NTJjNmVhNDMwNDdiYjM0NmRmNGUwMTdkNGRjOSJ9.NrvZF2vEjH_qjFOaQ5fWjfiCPvF2JGwBGN-E18dtC9sduaGRZe7O3N5rZ7QQlabLYoWZ6FmMU3FNIF_8RYvybhn181HWCVPm7eXcl-kkKhZAfjY8IuUpDKP0WoO2TwDBlwLNY_97AahhTt6AvvGk_UT4PopLO_ayf13FUkfkyPaQRLOUrue2wbiqEEMGicZ3kSWMayIcAoueaJ1PcPC1gFtogXebd2Hoe8WQVaD7Ep2txg2O7YoEFNxLathUHENKH8TDfV_or3IJ6PfxaeFyyYGVt-MlqiYIABkqYA-iJiddMj-SQ4mLWIpSR2atUfawy5w0TkTyTO2KB0YJROhbdw'
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
// exports.createDeliveryOrderForShippit = createDeliveryOrderForShippit;
exports.getAllDeliveryOrders = getAllDeliveryOrders;
exports.updateDeliveryOrder = updateDeliveryOrder;
exports.deleteDeliveryOrder = deleteDeliveryOrder;
exports.findDeliveryOrderById = findDeliveryOrderById;
exports.findDeliveryOrderByName = findDeliveryOrderByName;
exports.sendDeliveryOrderToShippit = sendDeliveryOrderToShippit;
exports.trackShippitOrder = trackShippitOrder;
exports.getAllDeliveryOrdersFromShippit = getAllDeliveryOrdersFromShippit;
