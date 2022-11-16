const { prisma } = require('./index.js');
const productModel = require('../models/productModel');

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
  procOrder = await prisma.procurementOrder.create({
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
      supplierEmail: supplier.email,
      currency: supplier.currency
    }
  });
  return procOrder;
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
  procOrder = await prisma.procurementOrder.update({
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
  const pos = await prisma.procurementOrder.findMany({
    include: { procOrderItems: true }
  });
  return pos;
};

const findProcurementOrderById = async (req) => {
  const { id } = req;
  const po = await prisma.procurementOrder.findUnique({
    where: {
      id: Number(id)
    },
    include: { procOrderItems: true }
  });
  return po;
};

const procOrderStructure = async (req) => {
  const { procOrderItems } = req;
  let procOrderItemsPdt = [];
  for (let p of procOrderItems) {
    const pdt = await productModel.findProductBySku({ sku: p.productSku });
    pdt.category = pdt.productCategory;
    delete pdt.productCategory;
    const newEntity = {
      id: p.id,
      procOrderId: p.procOrderId,
      quantity: p.quantity,
      product: {
        ...pdt,
        category: pdt.category.map((category) => category.category)
      }
    };
    procOrderItemsPdt.push(newEntity);
  }
  return procOrderItemsPdt;
};

exports.createProcurementOrder = createProcurementOrder;
exports.updateProcurementOrder = updateProcurementOrder;
exports.getAllProcurementOrders = getAllProcurementOrders;
exports.findProcurementOrderById = findProcurementOrderById;
exports.procOrderStructure = procOrderStructure;
