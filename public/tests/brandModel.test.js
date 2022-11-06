const brandModel = require('../models/brandModel');
const { createMockContext } = require('../models/context');

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

jest.mock('../models/index', () => {
  return {
    prisma: {
      create: jest.fn().mockImplementation(async () => {}),
      findMany: jest.fn().mockImplementation(async () => {}),
      deleteMany: jest.fn().mockImplementation(async () => {}),
      update: jest.fn().mockImplementation(async () => {}),
      findUnique: jest.fn().mockImplementation(async () => {})
    }
  };
});
const name = 'delicious';

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx;
});

test.skip('create brand model', async () => {
  const brand = { name };
  mockCtx.prisma.brand.create.mockResolvedValue({
    data: { name: 'Delicious' }
  });
  await expect(brandModel.createBrand({ name }, ctx)).resolves.toEqual({
    id: 1,
    name: 'delicious'
  });
});
