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
    transactionAmount,
    discountCode,
    orderId,
    payeeContactNo,
    payeeCompany
  } = req;

  return await prisma.bulkOrder.create({
    data: {
      orderId,
      amount,
      transactionAmount,
      discountCode,
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
          orderStatus: 'CREATED',
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
    amount,
    transactionAmount,
    discountCode
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
      transactionAmount,
      discountCode,
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

const deleteBulkOrder = async (req) => {
  const { id } = req;
  return await prisma.bulkOrder.delete({
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

const updateBulkOrderStatus = async (req) => {
  const { id, bulkOrderStatus } = req;
  const bulkOrder = await prisma.bulkOrder.update({
    where: {
      id
    },
    data: {
      bulkOrderStatus
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

const updateBulkOrderPaymentMode = async (req) => {
  const { orderId, paymentMode } = req;
  const bulkOrder = await prisma.bulkOrder.update({
    where: {
      orderId
    },
    data: {
      paymentMode
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

const updateBulkOrderStatusByOrderId = async (req) => {
  const { orderId, bulkOrderStatus } = req;
  const bulkOrder = await prisma.bulkOrder.update({
    where: {
      orderId
    },
    data: {
      bulkOrderStatus
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

const getAllBulkOrdersWithTimeFilter = async (req) => {
  const { time_from, time_to } = req;
  const bulkOrders = await prisma.bulkOrder.findMany({
    where: {
      createdTime: {
        lte: time_to, //last date
        gte: time_from //first date
      }
    },
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

const findBulkOrderByEmail = async (req) => {
  const { payeeEmail } = req;
  const bulkOrder = await prisma.bulkOrder.findMany({
    where: {
      payeeEmail
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

const getBulkOrdersByMonthForCustomer = async (req) => {
  const { payeeEmail } = req;
  const orders =
    await prisma.$queryRaw`select DATE_TRUNC('month',"createdTime") as month, COUNT("orderId") as numOrders, SUM("amount") as totalamount FROM "public"."BulkOrder" where "payeeEmail"=${payeeEmail} group by DATE_TRUNC('month',"createdTime") order by DATE_TRUNC('month',"createdTime")`;
  return orders;
};

exports.createBulkOrder = createBulkOrder;
exports.getAllBulkOrders = getAllBulkOrders;
exports.updateBulkOrder = updateBulkOrder;
exports.deleteBulkOrder = deleteBulkOrder;
exports.findBulkOrderById = findBulkOrderById;
exports.findBulkOrderByOrderId = findBulkOrderByOrderId;
exports.findBulkOrderByEmail = findBulkOrderByEmail;
exports.getAllBulkOrdersWithTimeFilter = getAllBulkOrdersWithTimeFilter;
exports.updateBulkOrderStatus = updateBulkOrderStatus;
exports.updateBulkOrderStatusByOrderId = updateBulkOrderStatusByOrderId;
exports.getBulkOrdersByMonthForCustomer =getBulkOrdersByMonthForCustomer;
exports.updateBulkOrderPaymentMode = updateBulkOrderPaymentMode;
