const { prisma } = require('./index.js');

const createBulkOrder = async (req) => {
  const {
    paymentMode,
    payeeName,
    payeeEmail,
    payeeRemarks,
    bulkOrderStatus,
    salesOrders
  } = req;

  await prisma.bulkOrder.create({
    data: {
      paymentMode,
      payeeName,
      payeeEmail,
      payeeRemarks,
      bulkOrderStatus,
      salesOrders: {
        create: salesOrders.map((salesOrder) => ({
          orderId: salesOrder.orderId,
          customerName,
          customerAddress,
          customerContactNo,
          customerEmail,
          postalCode,
          platformType,
          createdTime,
          currency,
          customerRemarks,
          orderStatus,
          amount: Number(amount),
          salesOrderItems: {
            create: salesOrderItems.map((so) => ({
              quantity: so.quantity,
              productName: so.productName,
              price: Number(so.price),
              salesOrderBundleItems: {
                create: so.salesOrderBundleItems.map((bi) => {
                  return {
                    productName: bi.product.name,
                    quantity: bi.quantity
                  };
                })
              },
              createdTime
            }))
          }
        }))
      }
    }
  });
};

const getAllProdCatalogue = async () => {
  const prodCatalogue = await prisma.productCatalogue.findMany({
    include: {
      product: true
    }
  });
  return prodCatalogue;
};

const updateProdCatalogue = async (req) => {
  const { id, price } = req;

  prodCatalogue = await prisma.productCatalogue.update({
    where: { id },
    data: {
      price
    }
  });
  return prodCatalogue;
};

const deleteProdCatalogue = async (req) => {
  const { id } = req;
  await prisma.productCatalogue.delete({
    where: {
      id: Number(id)
    }
  });
};

const findProdCatalogueById = async (req) => {
  const { id } = req;
  const prodCatalogue = await prisma.productCatalogue.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      product: true
    }
  });
  return prodCatalogue;
};

exports.createProdCatalogue = createProdCatalogue;
exports.getAllProdCatalogue = getAllProdCatalogue;
exports.updateProdCatalogue = updateProdCatalogue;
exports.deleteProdCatalogue = deleteProdCatalogue;
exports.findProdCatalogueById = findProdCatalogueById;
