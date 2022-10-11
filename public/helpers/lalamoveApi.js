const SDKClient = require("@lalamove/lalamove-js");

const sdkClient = new SDKClient.ClientModule(
  new SDKClient.Config(
    process.env.LALAMOVE_API_KEY,
    process.env.LALAMOVE_API_SECRET,
    "sandbox"
  )
);

const createQuotation = async (req) => {
  const co = {
    lat: "1.35917",
    lng: "103.96363",
  };
  const co2 = {
    lat: "1.29756",
    lng: "103.77952",
  };
  const stop1 = {
    coordinates: co,
    address: "2 Flora Drive",
  };
  const stop2 = {
    coordinates: co2,
    address: "Kent Ridge",
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
  const quotation = await createQuotation({});
  const orderPayload = SDKClient.OrderPayloadBuilder.orderPayload()
    .withIsPODEnabled(true)
    .withQuotationID(quotation.id)
    .withSender({
      stopId: quotation.stops[0].id,
      name: "Meryl",
      phone: "+6593861801",
    })
    .withRecipients([
      {
        stopId: quotation.stops[1].id,
        name: "Sample",
        phone: "+6596167708",
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

// need a fetch latest status and update DeliveryStatus

exports.createQuotation = createQuotation;
exports.placeLalamoveOrder = placeLalamoveOrder;
exports.getLalamoveOrder = getLalamoveOrder;
exports.cancelLalamoveOrder = cancelLalamoveOrder;
exports.getDriverDetails = getDriverDetails;
