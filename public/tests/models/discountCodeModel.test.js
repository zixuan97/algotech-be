const discountCodeModel = require('../../models/discountCodeModel');
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
const discountCode = {
  id: 1,
  discountCode: 'xmas2020',
  amount: 10,
  startDate: '2022-09-10T00:00:00.000Z',
  endDate: '2022-12-10T00:00:00.000Z',
  customerEmails: ['exleolee@gmail.com'],
  type: 'FLAT_AMOUNT',
  minOrderAmount: 20
};
jest.mock('../../models/index', () => {
  return {
    prisma: {
      discountCode: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {})
      }
    }
  };
});

test('create discount code model', async () => {
  prisma.discountCode.create.mockImplementation(async () => {
    return {
      discountCode
    };
  });
  await expect(
    discountCodeModel.createDiscountCode(discountCode)
  ).resolves.toEqual({ discountCode });
});

test('get all discount codes', async () => {
  await expect(discountCodeModel.getAllDiscountCodes()).resolves.toEqual([]);
});

test('update discount code', async () => {
  prisma.discountCode.update.mockImplementation(async () => {
    return discountCode;
  });
  await expect(
    discountCodeModel.updateDiscountCode(discountCode)
  ).resolves.toEqual(discountCode);
});

test('delete discount code', async () => {
  prisma.discountCode.delete.mockImplementation(async () => {
    return {};
  });
  await expect(
    discountCodeModel.deleteDiscountCode({ id: 1 })
  ).resolves.toEqual({});
});

test('find discount code by id', async () => {
  prisma.discountCode.findUnique.mockImplementation(async () => {
    return discountCode;
  });
  await expect(
    discountCodeModel.findDiscountCodeById({ id: 1 })
  ).resolves.toEqual(discountCode);
});

test('find discount code by code', async () => {
  prisma.discountCode.findUnique.mockImplementation(async () => {
    return discountCode;
  });
  await expect(
    discountCodeModel.findDiscountCode({ discountCode: 'xmas2020' })
  ).resolves.toEqual(discountCode);
});
