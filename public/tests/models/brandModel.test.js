const brandModel = require('../../models/brandModel');

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

jest.mock('../../models/index', () => {
  return {
    prisma: {
      brand: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => {}),
        deleteMany: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {})
      }
    }
  };
});
const name = 'delicious';

test('create brand model', async () => {
  const brand = { name };

  await expect(brandModel.createBrand(brand)).resolves.toEqual(undefined);
});
