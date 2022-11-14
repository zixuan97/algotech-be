const productCatalogueModel = require('../../models/productCatalogueModel');
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
    productCatalogueModel.createProdCatalogue(productCatalogue)
  ).resolves.toEqual({ productCatalogue });
});

test('get all product catalogue', async () => {
  await expect(productCatalogueModel.getAllProdCatalogue()).resolves.toEqual(
    []
  );
});

test('update product catalogue', async () => {
  prisma.productCatalogue.update.mockImplementation(async () => {
    return productCatalogue;
  });
  await expect(
    productCatalogueModel.updateProdCatalogue(productCatalogue)
  ).resolves.toEqual(productCatalogue);
});

test('delete product catalogue', async () => {
  prisma.productCatalogue.delete.mockImplementation(async () => {
    return {};
  });
  await expect(
    productCatalogueModel.deleteProdCatalogue({ id: 1 })
  ).resolves.toEqual({});
});

test('find product catalogue by id', async () => {
  prisma.productCatalogue.findUnique.mockImplementation(async () => {
    return productCatalogue;
  });
  await expect(
    productCatalogueModel.findProdCatalogueById({ id: 1 })
  ).resolves.toEqual(productCatalogue);
});
