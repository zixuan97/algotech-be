const app = require('../../../index');
const supertest = require('supertest');
const bulkOrderModel = require('../../models/bulkOrderModel');
const salesOrderModel = require('../../models/salesOrderModel');
const paymentModel = require('../../models/paymentModel');
const excelHelper = require('../../helpers/excel');
const emailHelper = require('../../helpers/email');
const pdfHelper = require('../../helpers/pdf');

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
  createdTime: new Date('2022-11-16T16:35:46.622Z'),
  payeeEmail: 'zac@thekettlegourmet.com',
  payeeRemarks: 'hi',
  bulkOrderStatus: 'PAYMENT_PENDING',
  orderStatus: 'PREPARED',
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
          productName: 'Nasi Lemak Mega Bundle (8 x 65g)',
          price: 6,
          quantity: 2
        },
        {
          productName: 'Curry Popcorn',
          price: 6,
          quantity: 2
        }
      ]
    }
  ]
};

jest.mock('../../models/bulkOrderModel', () => {
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

jest.mock('../../models/salesOrderModel', () => {
  return {
    updateSalesOrderStatus: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../models/customerModel', () => {
  return {
    connectOrCreateCustomer: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../helpers/excel', () => {
  return {
    generateBulkOrderExcel: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../helpers/email', () => {
  return {
    sendEmailWithAttachment: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../helpers/pdf', () => {
  return {
    generateBulkOrderPDF: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../helpers/sns', () => {
  return {
    sendOTP: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../models/paymentModel', () => {
  return {
    payByStripeCreditCard: jest.fn().mockImplementation(async () => {}),
    payByStripePaynow: jest.fn().mockImplementation(async () => {})
  };
});

test('Get all bulkOrders', async () => {
  await supertest(app).get('/bulkOrder/all').set('origin', 'jest').expect(200);
});

test('Get all bulkOrders, prisma error', async () => {
  bulkOrderModel.getAllBulkOrders.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).get('/bulkOrder/all').set('origin', 'jest').expect(400);
});

test('Create bulkOrder', async () => {
  bulkOrderModel.createBulkOrder.mockImplementation(async () => {
    return { amount: 24, orderId: 'test' };
  });
  await supertest(app)
    .post('/bulkOrder')
    .set('origin', 'jest')
    .send(bulkOrder)
    .expect(200);

  const bulkOrderCC = {
    amount: 24,
    discountCode: 'xmas2020',
    transactionAmount: 20,
    paymentMode: 'CREDIT_CARD',
    payeeName: 'Lee Leonard',
    payeeEmail: 'zac@thekettlegourmet.com',
    payeeRemarks: 'hi',
    bulkOrderStatus: 'PAYMENT_PENDING',
    payeeContactNo: '91114685',
    salesOrders: []
  };
  // credit card
  await supertest(app)
    .post('/bulkOrder')
    .set('origin', 'jest')
    .send(bulkOrderCC)
    .expect(200);
});

test('Create bulkOrder, create bulk order prisma error', async () => {
  bulkOrderModel.createBulkOrder.mockImplementation(async () => {
    throw new Error();
  });
  paymentModel;
  await supertest(app)
    .post('/bulkOrder')
    .set('origin', 'jest')
    .send(bulkOrder)
    .expect(400);
});

test('Create bulkOrder, payment prisma error', async () => {
  bulkOrderModel.createBulkOrder.mockImplementation(async () => {
    return { amount: 24, orderId: 'test' };
  });
  paymentModel.payByStripePaynow.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/bulkOrder')
    .set('origin', 'jest')
    .send(bulkOrder)
    .expect(400);
});

test('Find bulkOrder by id', async () => {
  bulkOrderModel.findBulkOrderById.mockImplementation(async () => {
    return {};
  });
  await supertest(app).get('/bulkOrder/id/1').set('origin', 'jest').expect(200);
});

test('Find bulkOrder by id, prisma error', async () => {
  bulkOrderModel.findBulkOrderById.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).get('/bulkOrder/id/1').set('origin', 'jest').expect(400);
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

test('Find bulkOrder by orderid, prisma error', async () => {
  bulkOrderModel.findBulkOrderByOrderId.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .get('/bulkOrder/orderId/1')
    .set('origin', 'jest')
    .expect(400);
});

test('Find bulkOrder by email', async () => {
  bulkOrderModel.findBulkOrderByEmail.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .get('/bulkOrder/email/1')
    .set('origin', 'jest')
    .expect(200);
});

test('Find bulkOrder by email,prisma error', async () => {
  bulkOrderModel.findBulkOrderByEmail.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .get('/bulkOrder/email/1')
    .set('origin', 'jest')
    .expect(400);
});

test('Get all bulkOrders with time filter', async () => {
  const body = {
    time_from: '2022-09-10T00:00:00.000Z',
    time_to: '2022-10-13T00:00:00.000Z'
  };
  await supertest(app)
    .post('/bulkOrder/timefilter')
    .set('origin', 'jest')
    .send(body)
    .expect(200);
});

test('Get all bulkOrders with time filter,prisma error', async () => {
  const body = {
    time_from: '2022-09-10T00:00:00.000Z',
    time_to: '2022-10-13T00:00:00.000Z'
  };

  bulkOrderModel.getAllBulkOrdersWithTimeFilter.mockImplementation(() => {
    throw new Error();
  });
  await supertest(app)
    .post('/bulkOrder/timefilter')
    .set('origin', 'jest')
    .send(body)
    .expect(400);
});

test('Update bulkOrder', async () => {
  bulkOrderModel.updateBulkOrder.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .put('/bulkOrder')
    .set('origin', 'jest')
    .send(bulkOrder)
    .expect(200);
});

test('Update bulkOrder, prisma error', async () => {
  bulkOrderModel.updateBulkOrder.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .put('/bulkOrder')
    .set('origin', 'jest')
    .send(bulkOrder)
    .expect(400);
});

test('Update bulkOrder status', async () => {
  bulkOrderModel.updateBulkOrderStatus.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .put('/bulkOrder/status')
    .set('origin', 'jest')
    .send(bulkOrder)
    .expect(200);
});

test('Update bulkOrder status, prisma error', async () => {
  bulkOrderModel.updateBulkOrderStatus.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .put('/bulkOrder/status')
    .set('origin', 'jest')
    .send(bulkOrder)
    .expect(400);
});

test('Mass Update bulkOrder status', async () => {
  bulkOrderModel.findBulkOrderById.mockImplementation(async () => {
    return bulkOrder;
  });

  salesOrderModel.updateSalesOrderStatus.mockImplementation(async () => {
    return {};
  });

  bulkOrderModel.updateBulkOrderStatus.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .put('/bulkOrder/salesOrderStatus')
    .set('origin', 'jest')
    .send(bulkOrder)
    .expect(200);
});

test('Mass Update bulkOrder status, order status not prepared,', async () => {
  bulkOrderModel.findBulkOrderById.mockImplementation(async () => {
    return {
      amount: 24,
      discountCode: 'xmas2020',
      transactionAmount: 20,
      paymentMode: 'CREDIT_CARD',
      payeeName: 'Lee Leonard',
      payeeEmail: 'zac@thekettlegourmet.com',
      payeeRemarks: 'hi',
      bulkOrderStatus: 'PAYMENT_PENDING',
      orderStatus: 'PREPARED',
      salesOrders: []
    };
  });

  salesOrderModel.updateSalesOrderStatus.mockImplementation(async () => {
    return {};
  });

  bulkOrderModel.updateBulkOrderStatus.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .put('/bulkOrder/salesOrderStatus')
    .set('origin', 'jest')
    .send({
      amount: 24,
      discountCode: 'xmas2020',
      transactionAmount: 20,
      paymentMode: 'CREDIT_CARD',
      payeeName: 'Lee Leonard',
      payeeEmail: 'zac@thekettlegourmet.com',
      payeeRemarks: 'hi',
      bulkOrderStatus: 'PAYMENT_PENDING',
      orderStatus: 'CREATED',
      payeeContactNo: '91114685',
      salesOrders: []
    })
    .expect(200);

  await supertest(app)
    .put('/bulkOrder/salesOrderStatus')
    .set('origin', 'jest')
    .send({
      amount: 24,
      discountCode: 'xmas2020',
      transactionAmount: 20,
      paymentMode: 'CREDIT_CARD',
      payeeName: 'Lee Leonard',
      payeeEmail: 'zac@thekettlegourmet.com',
      payeeRemarks: 'hi',
      bulkOrderStatus: 'PAYMENT_PENDING',
      orderStatus: 'PREPARED',
      salesOrders: []
    })
    .expect(200);
});

test('Mass Update bulkOrder status,prisma error', async () => {
  bulkOrderModel.findBulkOrderById.mockImplementation(async () => {
    return bulkOrder;
  });

  bulkOrderModel.updateBulkOrderStatus.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .put('/bulkOrder/salesOrderStatus')
    .set('origin', 'jest')
    .send(bulkOrder)
    .expect(400);
});

test('Generate bulk order excel', async () => {
  bulkOrderModel.findBulkOrderByEmail.mockImplementation(async () => {
    return [{ bulkOrder }];
  });

  excelHelper.generateBulkOrderExcel.mockImplementation(async () =>
    Promise.resolve({
      status: 200,
      blob: () => 'Data'
    })
  );
  await supertest(app)
    .post('/bulkOrder/excel')
    .set('origin', 'jest')
    .expect(400);
});

test('Generate bulk order excel, error', async () => {
  bulkOrderModel.findBulkOrderByEmail.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .post('/bulkOrder/excel')
    .set('origin', 'jest')
    .expect(400);
});

test('Generate bulk order summary pdf', async () => {
  bulkOrderModel.findBulkOrderByEmail.mockImplementation(async () => {
    return bulkOrder;
  });

  emailHelper.sendEmailWithAttachment.mockImplementation(async () => {});
  pdfHelper.generateBulkOrderPDF.mockImplementation(async () => {
    return '';
  });
  await supertest(app)
    .post('/bulkOrder/pdf/1')
    .set('origin', 'jest')
    .expect(200);
});

test('Generate bulk order summary pdf, error', async () => {
  bulkOrderModel.findBulkOrderByEmail.mockImplementation(async () => {
    return bulkOrder;
  });

  emailHelper.sendEmailWithAttachment.mockImplementation(async () => {});
  pdfHelper.generateBulkOrderPDF.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/bulkOrder/pdf/1')
    .set('origin', 'jest')
    .expect(400);
});
