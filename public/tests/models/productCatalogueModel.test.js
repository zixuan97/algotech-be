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
const productCatalogue = {
  price: 6.0,
  product: {
    id: 1,
    sku: 'SKU123',
    name: 'Nasi Lemak Popcorn',
    image: 'hello',
    qtyThreshold: 20,
    brandId: 1,
    stockQuantity: [
      {
        productId: 1,
        location: {
          id: 1,
          name: 'Punggol Warehouse',
          address: 'Blk 303B Punggol Central #05-792'
        },
        quantity: 20
      }
    ],
    brand: {
      id: 1,
      name: 'The Kettle Gourmet'
    },
    categories: [
      {
        id: 1,
        name: 'Asian Favourites'
      }
    ]
  },
  image: 'hello'
};
jest.mock('../../models/index', () => {
  return {
    prisma: {
      productCatalogue: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {})
      }
    }
  };
});

test('create product catalogue model', async () => {
  prisma.productCatalogue.create.mockImplementation(async () => {
    return {
      productCatalogue
    };
  });
  await expect(
    productCatalogueModel.createCatalogue(bundleCatalogue)
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
