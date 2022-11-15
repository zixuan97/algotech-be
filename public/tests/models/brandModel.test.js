const brandModel = require('../../models/brandModel');
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
const brand = { name: 'delicious popcorn' };
jest.mock('../../models/index', () => {
  return {
    prisma: {
      brand: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {})
      }
    }
  };
});

test('create brand model', async () => {
  prisma.brand.create.mockImplementation(async () => {
    return {
      brand
    };
  });
  await expect(brandModel.createBrand(brand)).resolves.toEqual({ brand });
});

test('get all brands', async () => {
  await expect(brandModel.getAllBrands()).resolves.toEqual([]);
});

test('update brand', async () => {
  prisma.brand.update.mockImplementation(async () => {
    return brand;
  });
  await expect(brandModel.updateBrands(brand)).resolves.toEqual(brand);
});

test('delete brand', async () => {
  prisma.brand.delete.mockImplementation(async () => {
    return {};
  });
  await expect(brandModel.deleteBrand({ id: 1 })).resolves.toEqual({});
});

test('find brand by id', async () => {
  prisma.brand.findUnique.mockImplementation(async () => {
    return brand;
  });
  await expect(brandModel.findBrandById({ id: 1 })).resolves.toEqual(brand);
});

test('find brand by name', async () => {
  prisma.brand.findUnique.mockImplementation(async () => {
    return brand;
  });
  await expect(
    brandModel.findBrandByName({ name: 'delicious' })
  ).resolves.toEqual(brand);
});
