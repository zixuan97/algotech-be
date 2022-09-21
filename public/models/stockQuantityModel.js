const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const connectOrCreateStockQuantity = async (req) => {
  const {
    productId,
    productName,
    productSku,
    locationId,
    quantity,
    locationName
  } = req;
  await prisma.StockQuantity.upsert({
    where: {
      productId_locationId: {
        productId,
        locationId
      }
    },
    update: {
      quantity: {
        increment: quantity
      }
    },
    create: {
      productId,
      productName,
      productSku,
      locationId,
      quantity,
      locationName
    }
  });
};

exports.connectOrCreateStockQuantity = connectOrCreateStockQuantity;
