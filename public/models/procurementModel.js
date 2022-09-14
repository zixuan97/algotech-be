const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProcurementOrder = async (req) => {
  const {
    order_date,
    description,
    payment_status,
    fulfilment_status,
    proc_order_items,
    supplier_id
  } = req;
  let totalAmount = 0;
  proc_order_items.map((p) => {
    totalAmount += p.quantity * p.rate;
  });
  await prisma.ProcurementOrder.create({
    data: {
      order_date,
      description,
      total_amount: totalAmount,
      payment_status,
      fulfilment_status,
      proc_order_items: {
        create: proc_order_items.map((p) => ({
          quantity: p.quantity,
          product_sku: p.product_sku,
          product_name: p.product_name,
          rate: p.rate
        }))
      },
      supplier: {
        connect: {
          id: supplier_id
        }
      }
    }
  });
};

const updateProcurementOrder = async (req) => {
  const {
    id,
    order_date,
    description,
    total_amount,
    payment_status,
    fulfilment_status,
    proc_order_items,
    supplier_id
  } = req;
  proc_order = await prisma.ProcurementOrder.update({
    where: { id },
    data: {
      order_date,
      description,
      total_amount,
      payment_status,
      fulfilment_status,
      proc_order_items,
      supplier_id
    }
  });
  return proc_order;
};

const getAllProcurementOrders = async () => {
  const pos = await prisma.ProcurementOrder.findMany({
    include: { proc_order_items : true }
  });
  return pos;
};

const findProcurementOrderById = async (req) => {
  const { id } = req;
  const po = await prisma.ProcurementOrder.findUnique({
    where: {
      id: Number(id)
    },
    include: { proc_order_items : true }
  });
  return po;
};

exports.createProcurementOrder = createProcurementOrder;
exports.updateProcurementOrder = updateProcurementOrder;
exports.getAllProcurementOrders = getAllProcurementOrders;
exports.findProcurementOrderById = findProcurementOrderById;
