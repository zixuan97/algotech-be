const procurementModel = require('../../models/procurementModel');
const productModel = require('../../models/productModel');
const { prisma } = require('../../models/index');

// mock logger to remove test logs
jest.mock('../../helpers/logger', () => {
  return {
    log: {
      out: jest.fn(),
      debug: jest.fn(),
      error: jest.fn()
    }
  };
});
const procurementOrder = {
  orderDate: new Date(),
  description: 'Procurement Order',
  totalAmount: 20,
  paymentStatus: 'PENDING',
  fulfilmentStatus: 'CREATED',
  warehouseName: 'Punggol Warehouse',
  warehouseAddress: 'Blk 303B Punggol Central #05-792',
  procOrderItems: [
    {
      quantity: 20,
      productSku: 'SKU123',
      productName: 'Nasi Lemak Popcorn',
      rate: 16
    }
  ],
  supplier: {
    id: 1,
    name: 'wee kek',
    address: 'Blk 117 Ang Mo Kio Ave 4 #08-467',
    email: 'tanwk@comp.nus.edu.sg',
    currency: 'SGD'
  }
};
jest.mock('../../models/index', () => {
  return {
    prisma: {
      procurementOrder: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {}),
        upsert: jest.fn().mockImplementation(async () => {})
      }
    }
  };
});

jest.mock('../../models/productModel', () => {
  return {
    findProductBySku: jest.fn().mockImplementation(async () => {})
  };
});

test('create procurement model', async () => {
  prisma.procurementOrder.create.mockImplementation(async () => {
    return {
      procurementOrder
    };
  });
  await expect(
    procurementModel.createProcurementOrder(procurementOrder)
  ).resolves.toEqual({
    procurementOrder
  });
});

test('get all procurement orders', async () => {
  await expect(procurementModel.getAllProcurementOrders()).resolves.toEqual([]);
});

test('update procurement order', async () => {
  prisma.procurementOrder.update.mockImplementation(async () => {
    return procurementOrder;
  });
  await expect(
    procurementModel.updateProcurementOrder(procurementOrder)
  ).resolves.toEqual(procurementOrder);
});

test('find procurement order by id', async () => {
  prisma.procurementOrder.findUnique.mockImplementation(async () => {
    return procurementOrder;
  });
  await expect(
    procurementModel.findProcurementOrderById({ id: 1 })
  ).resolves.toEqual(procurementOrder);
});

test('procurement order structure', async () => {
  productModel.findProductBySku.mockImplementation(() => {
    return {
      id: 2,
      sku: 'SKU124',
      name: 'Fish Head Curry Popcorn',
      image: null,
      qtyThreshold: 20,
      brandId: 1,
      productCategory: [{ category: [Object] }],
      stockQuantity: [{ productId: 2, location: [Object], quantity: 50 }],
      brand: { id: 1, name: 'The Kettle Gourmet' }
    };
  });
  await expect(
    procurementModel.procOrderStructure({
      procOrderItems: [
        {
          id: 1,
          procOrderId: 1,
          quantity: 20,
          productSku: 'SKU124',
          productName: 'Fish Head Curry Popcorn',
          rate: 16
        }
      ]
    })
  ).resolves.toEqual([
    {
      id: 1,
      procOrderId: 1,
      quantity: 20,
      product: {
        id: 2,
        sku: 'SKU124',
        name: 'Fish Head Curry Popcorn',
        image: null,
        qtyThreshold: 20,
        brandId: 1,
        stockQuantity: [{ productId: 2, location: [Object], quantity: 50 }],
        brand: { id: 1, name: 'The Kettle Gourmet' },
        category: [[Object]]
      }
    }
  ]);
});
