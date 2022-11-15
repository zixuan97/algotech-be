const bundleCatalogueModel = require('../../models/bundleCatalogueModel');
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
const bundleCatalogue = {
  price: 6.0,
  bundle: {
    id: 1,
    name: 'The Original Mini Pack Popcorn Bundle (Assortment of 8 Packs x 30g) - 1 box',
    description: 'Just a simple description',
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
        quantity: 2
      },
      {
        product: {
          id: 2,
          sku: 'SKU124',
          name: 'Curry Popcorn',
          image: null,
          qtyThreshold: 20,
          brandId: 1
        },
        productId: 2,
        quantity: 2
      }
    ]
  }
};
jest.mock('../../models/index', () => {
  return {
    prisma: {
      bundleCatalogue: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {})
      }
    }
  };
});

test('create bundle catalogue model', async () => {
  prisma.bundleCatalogue.create.mockImplementation(async () => {
    return {
      bundleCatalogue
    };
  });
  await expect(
    bundleCatalogueModel.createBundleCatalogue(bundleCatalogue)
  ).resolves.toEqual({ bundleCatalogue });
});

test('get all bundle catalogues', async () => {
  await expect(bundleCatalogueModel.getAllBundleCatalogue()).resolves.toEqual(
    []
  );
});

test('update bundle catalogue', async () => {
  prisma.bundleCatalogue.update.mockImplementation(async () => {
    return bundleCatalogue;
  });
  await expect(
    bundleCatalogueModel.updateBundleCatalogue(bundleCatalogue)
  ).resolves.toEqual(bundleCatalogue);
});

test('delete bundle catalogue', async () => {
  prisma.bundleCatalogue.delete.mockImplementation(async () => {
    return {};
  });
  await expect(
    bundleCatalogueModel.deleteBundleCatalogue({ id: 1 })
  ).resolves.toEqual({});
});

test('find bundle catalogue by id', async () => {
  prisma.bundleCatalogue.findUnique.mockImplementation(async () => {
    return bundleCatalogue;
  });
  await expect(
    bundleCatalogueModel.findBundleCatalogueById({ id: 1 })
  ).resolves.toEqual(bundleCatalogue);
});
