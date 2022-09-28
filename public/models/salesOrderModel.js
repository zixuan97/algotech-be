const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

const getOrdersByPlatformWithTimeFilter = async (req) => {
  const { time_from, time_to } = req;
  const bestSeller =
    await prisma.$queryRaw`select COUNT("orderId")as salesOrders, "platformType" as platformType from "public"."SalesOrder" where "createdTime">=${time_from} and "createdTime"<=${time_to} group by "platformType"`;
  return bestSeller;
};

const findSalesOrderById = async (req) => {
  const { id } = req;
  const salesOrder = await prisma.salesOrder.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      salesOrderItems: true
    }
  });
  return salesOrder;
};

const findSalesOrderByOrderId = async (req) => {
  const { orderId } = req;
  const salesOrder = await prisma.salesOrder.findUnique({
    where: {
      orderId
    },
    include: {
      salesOrderItems: true
    }
  });
  return salesOrder;
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
