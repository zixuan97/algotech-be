const bulkOrderModel = require('../../models/bulkOrderModel');
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
const bulkOrder = {
  amount: 24,
  discountCode: 'xmas2020',
  transactionAmount: 20,
  paymentMode: 'PAYNOW',
  payeeName: 'Lee Leonard',
  payeeEmail: 'exleolee@gmail.com',
  payeeRemarks: 'hi',
  bulkOrderStatus: 'PAYMENT_PENDING',
  payeeContactNo: '91114685',
  salesOrders: [
    {
      customerName: 'Lee Leonard',
      customerAddress:
        '303B Punggol Central 12345678898765432qasdfghjuytrewsdcf',
      postalCode: '822303',
      customerContactNo: '91114685',
      currency: 'SGD',
      amount: 24,
      platformType: 'B2B',
      orderStatus: 'CREATED',
      customerRemarks: 'Dear Leonard, Merry Christmas to you and ur family!',
      salesOrderItems: [
        {
          id: 1,
          productName: 'Nasi Lemak Popcorn',
          price: 6,
          quantity: 2,
          salesOrderBundleItems: [{ product: { name: 'hello' }, quantity: 1 }]
        },
        {
          productName: 'Curry Popcorn',
          price: 6,
          quantity: 2,
          salesOrderBundleItems: []
        }
      ]
    }
  ]
};
jest.mock('../../models/index', () => {
  return {
    prisma: {
      bulkOrder: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {})
      },
      salesOrder: {
        update: jest.fn().mockImplementation(async () => {})
      },
      salesOrderBundleItem: {
        deleteMany: jest.fn().mockImplementation(async () => {})
      },
      $queryRaw: jest.fn().mockImplementation(async () => [])
    }
  };
});

test('create bulk order model', async () => {
  prisma.bulkOrder.create.mockImplementation(async () => {
    return {
      bulkOrder
    };
  });
  await expect(bulkOrderModel.createBulkOrder(bulkOrder)).resolves.toEqual({
    bulkOrder
  });
});

test('get all bulk orders', async () => {
  await expect(bulkOrderModel.getAllBulkOrders()).resolves.toEqual([]);
});

test('get all bulk orders with time filter', async () => {
  await expect(
    bulkOrderModel.getAllBulkOrdersWithTimeFilter({
      time_from: '2022-09-10T00:00:00.000Z',
      time_to: '2022-10-13T00:00:00.000Z'
    })
  ).resolves.toEqual([]);
});

test('get bulk orders by month for customer', async () => {
  await expect(
    bulkOrderModel.getBulkOrdersByMonthForCustomer({
      payeeEmail: 'exleolee@gmail.com'
    })
  ).resolves.toEqual([]);
});

test('update bulk order', async () => {
  prisma.bulkOrder.update.mockImplementation(async () => {
    return bulkOrder;
  });
  await expect(bulkOrderModel.updateBulkOrder(bulkOrder)).resolves.toEqual(
    bulkOrder
  );
});

test('update bulk order status', async () => {
  prisma.bulkOrder.update.mockImplementation(async () => {
    return bulkOrder;
  });
  await expect(
    bulkOrderModel.updateBulkOrderStatus(bulkOrder)
  ).resolves.toEqual(bulkOrder);
});

test('update bulk order status', async () => {
  prisma.bulkOrder.update.mockImplementation(async () => {
    return bulkOrder;
  });
  await expect(
    bulkOrderModel.updateBulkOrderStatusByOrderId({
      orderId: '123',
      bulkOrderStatus: 'PAYMENT_SUCCESS'
    })
  ).resolves.toEqual(bulkOrder);
});

test('update bulk order payment mode', async () => {
  prisma.bulkOrder.update.mockImplementation(async () => {
    return bulkOrder;
  });
  await expect(
    bulkOrderModel.updateBulkOrderPaymentMode(bulkOrder)
  ).resolves.toEqual(bulkOrder);
});

test('delete bulk order', async () => {
  prisma.bulkOrder.delete.mockImplementation(async () => {
    return {};
  });
  await expect(bulkOrderModel.deleteBulkOrder({ id: 1 })).resolves.toEqual({});
});

test('find bulk order by id', async () => {
  prisma.bulkOrder.findUnique.mockImplementation(async () => {
    return bulkOrder;
  });
  await expect(bulkOrderModel.findBulkOrderById({ id: 1 })).resolves.toEqual(
    bulkOrder
  );
});

test('find bulk order by customer email', async () => {
  await expect(
    bulkOrderModel.findBulkOrderByEmail({ payeeEmail: 'exleolee@gmail.com' })
  ).resolves.toEqual([]);
});

test('find bulk order by orderId', async () => {
  prisma.bulkOrder.findUnique.mockImplementation(async () => {
    return bulkOrder;
  });
  await expect(
    bulkOrderModel.findBulkOrderByOrderId({ orderId: '12345' })
  ).resolves.toEqual(bulkOrder);
});
