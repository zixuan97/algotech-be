const bundleModel = require('../../models/bundleModel');
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
const bundle = {
  id: 1,
  name: 'Nasi Lemak Mega Bundle (8 x 65g)',
  description: '8 x Nasi Lemak Popcorn',
  bundleProduct: [
    {
      product: {
        id: 1,
        sku: 'SKU123',
        name: 'Nasi Lemak Popcorn',
        image: null,
        qtyThreshold: 20,
        brandId: 1
      },
      productId: 1,
      quantity: 8
    }
  ]
};
jest.mock('../../models/index', () => {
  return {
    prisma: {
      bundle: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {})
      }
    }
  };
});

test('create bundle model', async () => {
  prisma.bundle.create.mockImplementation(async () => {
    return {
      bundle
    };
  });
  await expect(bundleModel.createBundle(bundle)).resolves.toEqual({ bundle });
});

test('get all bundles', async () => {
  await expect(bundleModel.getAllBundles()).resolves.toEqual([]);
});

test('update bundle', async () => {
  prisma.bundle.update.mockImplementation(async () => {
    return bundle;
  });
  await expect(bundleModel.updateBundle(bundle)).resolves.toEqual(bundle);
});

test('delete bundle', async () => {
  prisma.bundle.delete.mockImplementation(async () => {
    return bundle;
  });
  await expect(bundleModel.deleteBundle({ id: 1 })).resolves.toEqual(bundle);
});

test('find bundle by id', async () => {
  prisma.bundle.findUnique.mockImplementation(async () => {
    return bundle;
  });
  await expect(bundleModel.findBundleById({ id: 1 })).resolves.toEqual(bundle);
});

test('find bundles with no bundlecat', async () => {
  prisma.bundle.findMany.mockImplementation(async () => {
    return [];
  });
  await expect(bundleModel.findBundlesWithNoBundleCat()).resolves.toEqual([]);
});

test('find bundle by name', async () => {
  prisma.bundle.findUnique.mockImplementation(async () => {
    return bundle;
  });
  await expect(
    bundleModel.findBundleByName({ name: 'delicious popcorn bundle' })
  ).resolves.toEqual(bundle);
});
