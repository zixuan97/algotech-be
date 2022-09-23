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
          price: Number(so.price)
        }))
      }
    }
  });
  return salesOrder;
};

const getAllSalesOrders = async () => {
  const salesOrders = await prisma.salesOrder.findMany({
    include: { salesOrderItems: true }
  });
  return salesOrders;
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
          price: Number(so.price)
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
