const customerModel = require('../../models/customerModel');
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
const customer = {
  id: 1,
  firstName: 'Rong Kang',
  lastName: 'Teh',
  company: null,
  totalSpent: 47,
  ordersCount: 1,
  email: 'tehrongkang@gmail.com',
  address: '18c Circuit Road 11-240 373018',
  postalCode: '373018',
  contactNo: '9823 4204',
  acceptsMarketing: false,
  createdAt: '2022-11-18T03:59:26.543Z',
  updatedAt: '2022-11-18T03:59:26.544Z',
  lastOrderDate: '2022-11-17T01:36:51.000Z',
  daysSinceLastPurchase: 1,
  ordersByMonth: [
    {
      month: '2022-11-01T00:00:00.000Z',
      numorders: 1,
      totalamount: 47
    }
  ],
  bulkOrdersByMonth: [],
  salesOrders: [
    {
      id: 3,
      orderId: '5205367095591',
      customerAddress: '18c Circuit Road 11-240 373018',
      customerContactNo: '9823 4204',
      customerEmail: 'tehrongkang@gmail.com',
      currency: 'SGD',
      customerName: 'Rong Kang Teh',
      platformType: 'SHOPIFY',
      postalCode: '373018',
      amount: 47,
      createdTime: '2022-11-17T01:36:51.000Z',
      customerRemarks: null,
      orderStatus: 'PAID',
      bulkOrderId: null,
      salesOrderItems: [
        {
          productName:
            'Stay At Home Family Popcorn Package (Bundle of 2 packs x 330g + 4 packs x 65g)',
          price: 45,
          quantity: 1,
          salesOrderId: 3,
          createdTime: '2022-11-17T01:36:51.000Z',
          salesOrderBundleItems: [],
          id: 4
        }
      ]
    }
  ],
  bulkOrders: []
};
jest.mock('../../models/index', () => {
  return {
    prisma: {
      customer: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        upsert: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {})
      }
    }
  };
});

test('create customer model', async () => {
  prisma.customer.create.mockImplementation(async () => {
    return {
      customer
    };
  });
  await expect(customerModel.createCustomer(customer)).resolves.toEqual({
    customer
  });
});

test('get all customers', async () => {
  await expect(customerModel.getAllCustomers()).resolves.toEqual([]);
});

test('update customer', async () => {
  prisma.customer.update.mockImplementation(async () => {
    return customer;
  });
  await expect(customerModel.updateCustomer(customer)).resolves.toEqual(
    customer
  );
});

test('delete customer', async () => {
  prisma.customer.delete.mockImplementation(async () => {
    return {};
  });
  await expect(customerModel.deleteCustomer({ id: 1 })).resolves.toEqual({});
});

test('find customer by id', async () => {
  prisma.customer.findUnique.mockImplementation(async () => {
    return customer;
  });
  await expect(customerModel.findCustomerById({ id: 1 })).resolves.toEqual(
    customer
  );
});

test('find customer by email', async () => {
  prisma.customer.findUnique.mockImplementation(async () => {
    return customer;
  });
  await expect(
    customerModel.findCustomerByEmail({ email: 'tehrongkang@gmail.com' })
  ).resolves.toEqual(customer);
});

test('connect or create customer', async () => {
  prisma.customer.upsert.mockImplementation(async () => {
    return customer;
  });
  await expect(
    customerModel.connectOrCreateCustomer(customer)
  ).resolves.toEqual(customer);
});

test('find customer by filter', async () => {
  prisma.customer.findMany.mockImplementation(async () => {
    return [];
  });
  await expect(
    customerModel.findCustomerByFilter({
      daysSinceLastPurchase: 10,
      allTimeOrderValue: 2.0,
      minAvgOrderValue: 0,
      maxAvgOrderValue: 20
    })
  ).resolves.toEqual([]);

  //test out different fields (optional fields)
  await expect(
    customerModel.findCustomerByFilter({
      allTimeOrderValue: 2.0,
      minAvgOrderValue: 0,
      maxAvgOrderValue: 20
    })
  ).resolves.toEqual([]);

  await expect(
    customerModel.findCustomerByFilter({
      daysSinceLastPurchase: 10,
      minAvgOrderValue: 0,
      maxAvgOrderValue: 20
    })
  ).resolves.toEqual([]);

  await expect(
    customerModel.findCustomerByFilter({
      daysSinceLastPurchase: 10,
      allTimeOrderValue: 2.0
    })
  ).resolves.toEqual([]);
});
