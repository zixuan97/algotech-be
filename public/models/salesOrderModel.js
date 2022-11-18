const { prisma } = require('./index.js');

const createSalesOrder = async (req) => {
  const {
    orderId,
    customerName,
    customerAddress,
    customerContactNo,
    customerEmail,
    postalCode,
    platformType,
    createdTime,
    currency,
    amount,
    customerRemarks,
    orderStatus,
    salesOrderItems
  } = req;
  salesOrder = await prisma.salesOrder.create({
    data: {
      orderId,
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
    }
  });
  return salesOrder;
};

const getAllSalesOrders = async () => {
  const salesOrders = await prisma.salesOrder.findMany({
    orderBy: {
      createdTime: 'asc'
    },
    include: { salesOrderItems: true }
  });
  return salesOrders;
};

const getAllSalesOrdersWithTimeFilter = async (req) => {
  const { time_from, time_to } = req;
  const salesOrders = await prisma.salesOrder.findMany({
    where: {
      createdTime: {
        lte: time_to, //last date
        gte: time_from //first date
      }
    },
    orderBy: {
      createdTime: 'asc'
    },
    include: { salesOrderItems: true }
  });
  return salesOrders;
};

const getSalesOrdersByDayWithTimeFilter = async (req) => {
  const { time_from, time_to } = req;
  const salesOrdersCount =
    await prisma.$queryRaw`select COALESCE(count("orderId"),0) as salesOrders , d.dt as createdDate from (select dt::date FROM generate_series(${time_from},${time_to},'1d')dt)d  left join  "public"."SalesOrder" c on DATE(c."createdTime") = d.dt  group by d.dt order by d.dt`;
  return salesOrdersCount;
};

const getRevenueByDayWithTimeFilter = async (req) => {
  const { time_from, time_to } = req;
  const revenue =
    await prisma.$queryRaw`select COALESCE(SUM(c."amount"),0) as revenue, d.dt as createdDate from (select dt::date FROM generate_series(${time_from},${time_to},'1d')dt)d  left join  "public"."SalesOrder" c on DATE(c."createdTime") = d.dt  group by d.dt order by d.dt`;

  return revenue;
};

const getBestSellerWithTimeFilter = async (req) => {
  const { time_from, time_to } = req;
  const bestSeller =
    await prisma.$queryRaw`select SUM("quantity")as quantity, "productName" as productName from "public"."SalesOrderItem" where "createdTime">=${time_from} and "createdTime"<=${time_to} group by "productName"`;
  return bestSeller;
};

const getTotalValueOfOrdersWithTimeFilter = async (req) => {
  const { time_from, time_to } = req;
  const totalValue =
    await prisma.$queryRaw`select SUM("amount")as amount from "public"."SalesOrder" where "createdTime">=${time_from} and "createdTime"<=${time_to} `;
  return totalValue;
};

const getOrdersByPlatformWithTimeFilter = async (req) => {
  const { time_from, time_to } = req;
  const bestSeller =
    await prisma.$queryRaw`select COUNT("orderId")as salesOrders, "platformType" as platformType from "public"."SalesOrder" where "createdTime">=${time_from} and "createdTime"<=${time_to} group by "platformType"`;
  return bestSeller;
};

const getOrdersByMonthForCustomer = async (req) => {
  const { customerEmail } = req;
  const orders =
    await prisma.$queryRaw`select DATE_TRUNC('month',"createdTime") as month, COUNT("orderId") as numOrders, SUM("amount") as totalamount FROM "public"."SalesOrder" where "customerEmail"=${customerEmail} group by DATE_TRUNC('month',"createdTime") order by DATE_TRUNC('month',"createdTime")`;
  return orders;
};

const findSalesOrderById = async (req) => {
  const { id } = req;
  const salesOrder = await prisma.salesOrder.findUnique({
    where: {
      id: Number(id)
    },
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
  });
  return salesOrder;
};

const findSalesOrderByCustomerEmail = async (req) => {
  const { customerEmail } = req;
  const salesOrders = await prisma.salesOrder.findMany({
    where: {
      customerEmail
    },
    orderBy: {
      createdTime: 'asc'
    },
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
  });
  return salesOrders;
};

const findSalesOrderByOrderId = async (req) => {
  const { orderId } = req;
  const salesOrder = await prisma.salesOrder.findUnique({
    where: {
      orderId
    },
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
  });
  return salesOrder;
};

const getAllSalesOrderItemsWithTimeFilter = async (req) => {
  const { time_from, time_to } = req;
  const salesOrderItems = await prisma.salesOrderItem.findMany({
    where: {
      createdTime: {
        lte: time_to, //last date
        gte: time_from //first date
      }
    }
  });
  return salesOrderItems;
};

const getSalesOfProductOverTimeWithTimeFilter = async (req) => {
  const { time_from, time_to, productName } = req;
  const products =
    await prisma.$queryRaw`select COALESCE(SUM("quantity"),0) as quantity , d.dt as createdDate from (select dt::date FROM generate_series(${time_from},${time_to},'1d')dt)d  left join  "public"."SalesOrderItem" c  on DATE(c."createdTime") = d.dt and c."productName"=${productName} group by d.dt order by d.dt`;
  return products;
};

const getBestSellerSalesOrderItemWithTimeFilter = async (req) => {
  const { time_from, time_to } = req;
  const bestSeller =
    await prisma.$queryRaw`select SUM("quantity")as quantity, "productName" as productName from "public"."SalesOrderItem" where "createdTime">=${time_from} and "createdTime"<=${time_to} group by "productName"`;
  return bestSeller;
};

const updateSalesOrderStatus = async (req) => {
  const { id, orderStatus } = req;
  await prisma.salesOrder.update({
    where: {
      id: Number(id)
    },
    data: {
      orderStatus
    }
  });
};

const updateSalesOrder = async (req) => {
  const {
    id,
    orderId,
    customerName,
    customerAddress,
    customerContactNo,
    customerEmail,
    postalCode,
    platformType,
    createdTime,
    currency,
    amount,
    customerRemarks,
    orderStatus,
    salesOrderItems
  } = req;
  await Promise.all(
    salesOrderItems.map(async (so) => {
      if (so.id) {
        await prisma.salesOrderBundleItem.deleteMany({
          where: { salesOrderItemId: Number(so.id) }
        });
      }
    })
  );

  await prisma.salesOrder.update({
    where: {
      id: Number(id)
    },
    data: {
      customerName,
      customerAddress,
      customerContactNo,
      customerEmail,
      postalCode,
      platformType,
      currency,
      customerRemarks,
      orderStatus,
      amount: Number(amount),
      salesOrderItems: {
        deleteMany: {},
        create: salesOrderItems.map((so) => ({
          quantity: so.quantity,
          productName: so.productName,
          price: Number(so.price),
          salesOrderBundleItems: {
            create: so.salesOrderBundleItems?.map((bi) => {
              return {
                productName: bi.productName,
                quantity: bi.quantity
              };
            })
          },
          createdTime
        }))
      }
    }
  });
};

exports.createSalesOrder = createSalesOrder;
exports.findSalesOrderById = findSalesOrderById;
exports.findSalesOrderByOrderId = findSalesOrderByOrderId;
exports.updateSalesOrder = updateSalesOrder;
exports.updateSalesOrderStatus = updateSalesOrderStatus;
exports.getAllSalesOrders = getAllSalesOrders;
exports.getAllSalesOrdersWithTimeFilter = getAllSalesOrdersWithTimeFilter;
exports.getSalesOrdersByDayWithTimeFilter = getSalesOrdersByDayWithTimeFilter;
exports.getRevenueByDayWithTimeFilter = getRevenueByDayWithTimeFilter;
exports.getBestSellerWithTimeFilter = getBestSellerWithTimeFilter;
exports.getOrdersByPlatformWithTimeFilter = getOrdersByPlatformWithTimeFilter;
exports.findSalesOrderByCustomerEmail = findSalesOrderByCustomerEmail;
exports.getOrdersByMonthForCustomer = getOrdersByMonthForCustomer;
exports.getBestSellerSalesOrderItemWithTimeFilter =
  getBestSellerSalesOrderItemWithTimeFilter;
exports.getSalesOfProductOverTimeWithTimeFilter =
  getSalesOfProductOverTimeWithTimeFilter;
exports.getAllSalesOrderItemsWithTimeFilter =
  getAllSalesOrderItemsWithTimeFilter;
exports.getTotalValueOfOrdersWithTimeFilter =
  getTotalValueOfOrdersWithTimeFilter;
