const app = require('../../index');
const supertest = require('supertest');
const bulkOrderModel = require('../models/bulkOrderModel');

// mock logger to remove test logs
jest.mock('../helpers/logger', () => {
  return {
    log: {
      out: jest.fn(),
      debug: jest.fn(),
      error: jest.fn()
    }
  };
});

jest.mock('../models/bulkOrderModel', () => {
  return {
    createBulkOrder: jest.fn().mockImplementation(async () => {}),
    getAllBulkOrders: jest.fn().mockImplementation(async () => []),
    updateBulkOrder: jest.fn().mockImplementation(async () => {}),
    deleteBulkOrder: jest.fn().mockImplementation(async () => []),
    findBulkOrderById: jest.fn().mockImplementation(async () => {}),
    findBulkOrderByOrderId: jest.fn().mockImplementation(async () => {}),
    findBulkOrderByEmail: jest.fn().mockImplementation(async () => {}),
    getAllBulkOrdersWithTimeFilter: jest
      .fn()
      .mockImplementation(async () => []),
    updateBulkOrderStatus: jest.fn().mockImplementation(async () => {}),
    updateBulkOrderStatusByOrderId: jest
      .fn()
      .mockImplementation(async () => {}),
    getBulkOrdersByMonthForCustomer: jest
      .fn()
      .mockImplementation(async () => {}),
    updateBulkOrderPaymentMode: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../models/customerModel', () => {
  return {
    connectOrCreateCustomer: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../helpers/excel', () => {
  return {
    generateBulkOrderExcel: jest.fn().mockImplementation(async () => {
      return {};
    })
  };
});

jest.mock('../models/paymentModel', () => {
  return {
    payByStripeCreditCard: jest.fn().mockImplementation(async () => {}),
    payByStripePaynow: jest.fn().mockImplementation(async () => {})
  };
});

test('Get all bulkOrders', async () => {
  await supertest(app)
    .get('/bulkOrder/all')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual([]);
    });
});

test('Create bulkOrder', async () => {
  const bulkOrder = {
    amount: 24,
    paymentMode: 'CREDIT_CARD',
    payeeName: 'Lee Leonard',
    payeeEmail: 'destineeow32@gmail.com',
    payeeRemarks: 'hi',
    bulkOrderStatus: 'CREATED',
    payeeContactNo: '91114685',
    salesOrders: []
  };

  bulkOrderModel.createBulkOrder.mockImplementation(async () => {
    return { amount: 24, orderId: 'test' };
  });
  await supertest(app)
    .post('/bulkOrder')
    .set('origin', 'jest')
    .send(bulkOrder)
    .then((response) => {
      expect(response.body).toStrictEqual({
        bulkOrder: { amount: 24, orderId: 'test' }
      });
    });
});

test('Find bulkOrder by id', async () => {
  bulkOrderModel.findBulkOrderById.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .get('/bulkOrder/id/1')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test('Find bulkOrder by orderid', async () => {
  bulkOrderModel.findBulkOrderByOrderId.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .get('/bulkOrder/orderId/1')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test('Find bulkOrder by email', async () => {
  bulkOrderModel.findBulkOrderByEmail.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .get('/bulkOrder/email/1')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test('Get all bulkOrders with time filter', async () => {
  await supertest(app)
    .get('/bulkOrder/timefilter')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test('Update bulkOrder', async () => {
  const bulkOrder = {
    id: 1,
    amount: 24,
    paymentMode: 'CREDIT_CARD',
    payeeName: 'Lee Leonard',
    payeeEmail: 'destineeow32@gmail.com',
    payeeRemarks: 'hi',
    bulkOrderStatus: 'CREATED',
    payeeContactNo: '91114685',
    salesOrders: []
  };

  bulkOrderModel.updateBulkOrder.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .put('/bulkOrder')
    .set('origin', 'jest')
    .send(bulkOrder)
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test('Update bulkOrder status', async () => {
  const bulkOrder = {
    id: 1,
    bulkOrderStatus: 'CREATED'
  };

  bulkOrderModel.updateBulkOrderStatus.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .put('/bulkOrder/status')
    .set('origin', 'jest')
    .send(bulkOrder)
    .then((response) => {
      expect(response.body).toStrictEqual({
        message: `Successfully updated bulk order with id: ${1}`
      });
    });
});

test('Mass Update bulkOrder status', async () => {
  const bulkOrder = {
    id: 1,
    bulkOrderStatus: 'CREATED'
  };
  bulkOrderModel.findBulkOrderById.mockImplementation(async () => {
    return { salesOrders: [] };
  });

  bulkOrderModel.updateBulkOrderStatus.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .put('/bulkOrder/salesOrderStatus')
    .set('origin', 'jest')
    .send(bulkOrder)
    .then((response) => {
      expect(response.body).toStrictEqual({
        message: `Successfully updated sales order status with bulk order id: ${1}`
      });
    });
});

test('Generate bulk order excel', async () => {
  bulkOrderModel.findBulkOrderByEmail.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .post('/bulkOrder/excel')
    .set('origin', 'jest')
    .then(() => {
      expect(400);
    });
});
