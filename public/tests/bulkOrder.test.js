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
      .mockImplementation(async () => {}),
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
