const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProcurementOrder = async (req) => {
  const {
    orderDate,
    description,
    paymentStatus,
    fulfilmentStatus,
    warehouseName,
    warehouseAddress,
    procOrderItems,
    supplier
  } = req;
  let totalAmount = 0;
  procOrderItems.map((p) => {
    totalAmount += p.quantity * p.rate;
  });
  await prisma.ProcurementOrder.create({
    data: {
      orderDate,
      description,
      totalAmount: totalAmount,
      paymentStatus,
      fulfilmentStatus,
      warehouseName,
      warehouseAddress,
      procOrderItems: {
        create: procOrderItems.map((p) => ({
          quantity: p.quantity,
          productSku: p.productSku,
          productName: p.productName,
          rate: p.rate
        }))
      },
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierAddress: supplier.address,
      supplierEmail: supplier.email
    }
  });
};

const updateProcurementOrder = async (req) => {
  const {
    id,
    orderDate,
    description,
    totalAmount,
    paymentStatus,
    fulfilmentStatus,
    warehouseAddress,
    procOrderItems
  } = req;
  procOrder = await prisma.ProcurementOrder.update({
    where: { id },
    data: {
      orderDate,
      description,
      totalAmount,
      paymentStatus,
      fulfilmentStatus,
      warehouseAddress,
      procOrderItems
    }
  });
  return procOrder;
};

const getAllProcurementOrders = async () => {
  const pos = await prisma.ProcurementOrder.findMany({
    include: { procOrderItems: true }
  });
  return pos;
};

const findProcurementOrderById = async (req) => {
  const { id } = req;
  const po = await prisma.ProcurementOrder.findUnique({
    where: {
      id: Number(id)
    },
    include: { procOrderItems: true }
  });
  return po;
};

exports.createProcurementOrder = createProcurementOrder;
exports.updateProcurementOrder = updateProcurementOrder;
exports.getAllProcurementOrders = getAllProcurementOrders;
exports.findProcurementOrderById = findProcurementOrderById;
