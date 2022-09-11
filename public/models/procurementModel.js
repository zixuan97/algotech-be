const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProcurementOrder = async (req) => {
  const { order_date, amount, description, payment_status, fulfilment_status, proc_order_items, supplier_id } = req;

  await prisma.ProcurementOrder.create({
    data: {
      order_date,
      amount,
      description,
      payment_status,
      fulfilment_status,
      proc_order_items: {
        create: proc_order_items.map((p) => ({
          quantity: p.quantity,
          product: {
            connect: {
              id: p.product_id
            }
          }
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
  const { id, order_date, amount, description, payment_status, fulfilment_status, proc_order_items, supplier_id } = req;
  proc_order = await prisma.ProcurementOrder.update({
    where: { id },
    data: {
      order_date,
      amount,
      description,
      payment_status,
      fulfilment_status,
      proc_order_items,
      supplier_id
    }
  });
  return proc_order;
};

const getAllProcurementOrders = async () => {
  const pos = await prisma.ProcurementOrder.findMany({});
  return pos;
};

const findProcurementOrderById = async (req) => {
  const { id } = req;
  const po = await prisma.ProcurementOrder.findUnique({
    where: {
      id: Number(id)
    }
  });
  return po;
};

exports.createProcurementOrder = createProcurementOrder;
exports.updateProcurementOrder = updateProcurementOrder;
exports.getAllProcurementOrders = getAllProcurementOrders;
exports.findProcurementOrderById = findProcurementOrderById;