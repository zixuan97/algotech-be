const SDKClient = require("@lalamove/lalamove-js");

const sdkClient = new SDKClient.ClientModule(
  new SDKClient.Config(
    process.env.LALAMOVE_API_KEY,
    process.env.LALAMOVE_API_SECRET,
    "sandbox"
  )
);

const createQuotation = async (req) => {
  const { senderLat, senderLng, recipientLat, recipientLng, senderAddress, recipientAddress } = req; 
  const co = {
    lat: recipientLat,
    lng: recipientLng,
  };
  const co2 = {
    lat: senderLat,
    lng: senderLng,
  };
  const stop1 = {
    coordinates: co,
    address: senderAddress,
  };
  const stop2 = {
    coordinates: co2,
    address: recipientAddress,
  };
  const quotationPayload = SDKClient.QuotationPayloadBuilder.quotationPayload()
    .withLanguage("en_SG")
    .withServiceType("CAR")
    .withStops([stop1, stop2])
    .build();
  const quote = await sdkClient.Quotation.create("SG", quotationPayload);
  return quote;
};

const placeLalamoveOrder = async (req) => {
  const { senderLat, senderLng, recipientLat, recipientLng, senderAddress, recipientAddress, senderName, senderPhone, recipientName, recipientPhone } = req; 
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
      phone: senderPhone,
    })
    .withRecipients([
      {
        stopId: quotation.stops[1].id,
        name: recipientName,
        phone: recipientPhone,
      },
    ])
    .withMetadata({
      "internalId": "123123"
    })
    .build();
  const order = await sdkClient.Order.create("SG", orderPayload);
  return order;
};

const getLalamoveOrder = async (req,) => {
  const { id } = req;
  const order = await sdkClient.Order.retrieve("SG", id);
  return order;
};

const cancelLalamoveOrder = async (req) => {
  const { id } = req;
  await sdkClient.Order.cancel("SG", id);
};

const getDriverDetails = async (req) => {
  const { orderId } = req;
  const order = await getLalamoveOrder({ id: orderId });
  console.log(orderId)
  return await sdkClient.Driver.retrieve("SG", order.driverId, orderId);
};

const fetchLatestStatusFromLalamoveAndAddToStatus = async (req) => {
    const { orderId } = req;
    const deliveryOrder = await getLalamoveOrder({ id: orderId });
    const latestStatus = deliveryOrder.status;
    const deliveryStatus = await prisma.DeliveryStatus.findMany({
      where: {
        deliveryOrderId: deliveryOrder.id,
        status: latestStatus
      }
    });
    if (deliveryStatus[0] === undefined) {
      await prisma.DeliveryStatus.create({
        data: {
          status: latestStatus,
          statusOwner: '',
          date: new Date(Date.now()).toLocaleDateString(),
          timestamp: new Date(Date.now()).toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore' }),
          deliveryOrder: {
            connect: {
              id: deliveryOrder.id
            }
          }
        }
      });
    }
  };

exports.createQuotation = createQuotation;
exports.placeLalamoveOrder = placeLalamoveOrder;
exports.getLalamoveOrder = getLalamoveOrder;
exports.cancelLalamoveOrder = cancelLalamoveOrder;
exports.getDriverDetails = getDriverDetails;
exports.fetchLatestStatusFromLalamoveAndAddToStatus = fetchLatestStatusFromLalamoveAndAddToStatus;
