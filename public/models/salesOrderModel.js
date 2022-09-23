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

exports.createSalesOrder = createSalesOrder;
