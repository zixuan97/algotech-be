const { prisma } = require('./index.js');

const createBulkOrder = async (req) => {
  const {
    paymentMode,
    payeeName,
    payeeEmail,
    payeeRemarks,
    bulkOrderStatus,
    salesOrders,
    amount,
    orderId,
    payeeContactNo,
    payeeCompany
  } = req;

  return await prisma.bulkOrder.create({
    data: {
      orderId,
      amount,
      paymentMode,
      payeeName,
      payeeEmail,
      payeeRemarks,
      payeeContactNo,
      bulkOrderStatus,
      payeeCompany,
      salesOrders: {
        create: salesOrders.map((salesOrder) => ({
          orderId: salesOrder.orderId,
          customerName: salesOrder.customerName,
          customerAddress: salesOrder.customerAddress,
          customerContactNo: salesOrder.customerContactNo,
          customerEmail: salesOrder.customerEmail,
          postalCode: salesOrder.postalCode,
          platformType: salesOrder.platformType,
          createdTime: salesOrder.createdTime,
          currency: salesOrder.currency,
          customerRemarks: salesOrder.customerRemarks,
          amount: Number(salesOrder.amount),
          salesOrderItems: {
            create: salesOrder.salesOrderItems.map((so) => ({
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
              createdTime: salesOrder.createdTime
            }))
          }
        }))
      }
    },
    include: {
      salesOrders: {
        include: {
          salesOrderItems: {
            select: {
              productName: true,
              price: true,
              quantity: true,
              salesOrderId: true,
              createdTime: true,
              salesOrderBundleItems: true,
              id: true
            }
          }
        }
      }
    }
  });
};

const getAllBulkOrders = async () => {
  const bulkOrders = await prisma.bulkOrder.findMany({
    orderBy: {
      createdTime: 'asc'
    },
    include: {
      salesOrders: {
        include: {
          salesOrderItems: {
            select: {
              productName: true,
              price: true,
              quantity: true,
              salesOrderId: true,
              createdTime: true,
              salesOrderBundleItems: true,
              id: true
            }
          }
        }
      }
    }
  });
  return bulkOrders;
};

const updateBulkOrder = async (req) => {
  const {
    id,
    paymentMode,
    payeeName,
    payeeEmail,
    payeeRemarks,
    bulkOrderStatus,
    salesOrders,
    payeeContactNo,
    payeeCompany,
    amount
  } = req;

  await Promise.all(
    salesOrders.map(async (so) => {
      await Promise.all(
        so.salesOrderItems.map(async (soi) => {
          if (soi.id) {
            await prisma.salesOrderBundleItem.deleteMany({
              where: { salesOrderItemId: Number(soi.id) }
            });
          }
        })
      );
      await prisma.salesOrder.update({
        where: { id: Number(so.id) },
        data: {
          salesOrderItems: {
            deleteMany: {}
          }
        }
      });
    })
  );

  return await prisma.bulkOrder.update({
    where: {
      id: Number(id)
    },
    data: {
      payeeContactNo,
      amount,
      paymentMode,
      payeeName,
      payeeEmail,
      payeeRemarks,
      bulkOrderStatus,
      payeeCompany,
      salesOrders: {
        deleteMany: {},
        create: salesOrders.map((salesOrder) => ({
          orderId: salesOrder.orderId,
          customerName: salesOrder.customerName,
          customerAddress: salesOrder.customerAddress,
          customerContactNo: salesOrder.customerContactNo,
          customerEmail: salesOrder.customerEmail,
          postalCode: salesOrder.postalCode,
          platformType: salesOrder.platformType,
          createdTime: salesOrder.createdTime,
          currency: salesOrder.currency,
          customerRemarks: salesOrder.customerRemarks,
          amount: Number(salesOrder.amount),
          salesOrderItems: {
            create: salesOrder.salesOrderItems.map((so) => ({
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
              createdTime: salesOrder.createdTime
            }))
          }
        }))
      }
    }
  });
};

const deleteBulkOrder = async (req) => {
  const { id } = req;
  await prisma.bulkOrder.delete({
    where: {
      id: Number(id)
    }
  });
};

const findBulkOrderById = async (req) => {
  const { id } = req;
  const bulkOrder = await prisma.bulkOrder.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      salesOrders: {
        include: {
          salesOrderItems: {
            select: {
              productName: true,
              price: true,
              quantity: true,
              salesOrderId: true,
              createdTime: true,
              salesOrderBundleItems: true,
              id: true
            }
          }
        }
      }
    }
  });
  return bulkOrder;
};

const findBulkOrderByOrderId = async (req) => {
  const { orderId } = req;
  const bulkOrder = await prisma.bulkOrder.findUnique({
    where: {
      orderId
    },
    include: {
      salesOrders: {
        include: {
          salesOrderItems: {
            select: {
              productName: true,
              price: true,
              quantity: true,
              salesOrderId: true,
              createdTime: true,
              salesOrderBundleItems: true,
              id: true
            }
          }
        }
      }
    }
  });
  return bulkOrder;
};

exports.createBulkOrder = createBulkOrder;
exports.getAllBulkOrders = getAllBulkOrders;
exports.updateBulkOrder = updateBulkOrder;
exports.deleteBulkOrder = deleteBulkOrder;
exports.findBulkOrderById = findBulkOrderById;
exports.findBulkOrderByOrderId = findBulkOrderByOrderId;
