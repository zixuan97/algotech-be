const SDKClient = require('@lalamove/lalamove-js');
const { prisma } = require('../models/index');
const deliveryModel = require('../models/deliveryModel');
const salesOrderModel = require('../models/salesOrderModel');
const { OrderStatus } = require('@prisma/client');
const sdkClient = new SDKClient.ClientModule(
  new SDKClient.Config(
    process.env.LALAMOVE_API_KEY,
    process.env.LALAMOVE_API_SECRET,
    'sandbox'
  )
);

const createQuotation = async (req) => {
  const {
    senderLat,
    senderLng,
    recipientLat,
    recipientLng,
    senderAddress,
    recipientAddress
  } = req;
  const co = {
    lat: recipientLat,
    lng: recipientLng
  };
  const co2 = {
    lat: senderLat,
    lng: senderLng
  };
  const stop1 = {
    coordinates: co,
    address: senderAddress
  };
  const stop2 = {
    coordinates: co2,
    address: recipientAddress
  };
  const quotationPayload = SDKClient.QuotationPayloadBuilder.quotationPayload()
    .withLanguage('en_SG')
    .withServiceType('CAR')
    .withStops([stop1, stop2])
    .build();
  const quote = await sdkClient.Quotation.create('SG', quotationPayload);
  return quote;
};

const placeLalamoveOrder = async (req) => {
  const {
    senderLat,
    senderLng,
    recipientLat,
    recipientLng,
    senderAddress,
    recipientAddress,
    senderName,
    senderPhone,
    recipientName,
    recipientPhone
  } = req;
  const quotation = await createQuotation({
    senderLat,
    senderLng,
    recipientLat,
    recipientLng,
    senderAddress,
    recipientAddress
  });
  const orderPayload = SDKClient.OrderPayloadBuilder.orderPayload()
    .withIsPODEnabled(true)
    .withQuotationID(quotation.id)
    .withSender({
      stopId: quotation.stops[0].id,
      name: senderName,
      phone: senderPhone
    })
    .withRecipients([
      {
        stopId: quotation.stops[1].id,
        name: recipientName,
        phone: recipientPhone
      }
    ])
    .withMetadata({
      internalId: '123123'
    })
    .build();
  const order = await sdkClient.Order.create('SG', orderPayload);
  return order;
};

const getLalamoveOrder = async (req) => {
  const { id } = req;
  const order = await sdkClient.Order.retrieve('SG', id);
  return order;
};

const cancelLalamoveOrder = async (req) => {
  const { orderId } = req;
  await sdkClient.Order.cancel('SG', orderId);
};

const getDriverDetails = async (req) => {
  const { id } = req;
  const deliveryOrder = await deliveryModel.findDeliveryOrderById({ id });
  const order = await getLalamoveOrder({
    id: deliveryOrder.shippitTrackingNum
  });
  return await sdkClient.Driver.retrieve(
    'SG',
    order.driverId,
    deliveryOrder.shippitTrackingNum
  );
};

const fetchLatestStatusFromLalamoveAndAddToStatus = async (req) => {
  const { orderId } = req;
  const lalamoveOrder = await getLalamoveOrder({ id: orderId });
  const deliveryOrder = await deliveryModel.findDeliveryOrderByLalamoveOrderId({
    orderId
  });
  const latestStatus = lalamoveOrder.status;
  if (latestStatus === 'REJECTED') {
    await salesOrderModel.updateSalesOrderStatus({
      id: deliveryOrder.salesOrderId,
      orderStatus: OrderStatus.PREPARED
    });
  }
  // const deliveryStatus = await prisma.DeliveryStatus.findMany({
  //   where: {
  //     deliveryOrderId: deliveryOrder.id,
  //     status: latestStatus
  //   }
  // });
  // if (
  //   deliveryStatus[0] === undefined ||
  //   deliveryStatus[0].status === 'ASSIGNING_DRIVER'
  // ) {
  try {
    await prisma.DeliveryStatus.create({
      data: {
        status: latestStatus,
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
  } catch (error) {
    console.log('Crashed...');
  }
  //}
};

exports.createQuotation = createQuotation;
exports.placeLalamoveOrder = placeLalamoveOrder;
exports.getLalamoveOrder = getLalamoveOrder;
exports.cancelLalamoveOrder = cancelLalamoveOrder;
exports.getDriverDetails = getDriverDetails;
exports.fetchLatestStatusFromLalamoveAndAddToStatus =
  fetchLatestStatusFromLalamoveAndAddToStatus;
