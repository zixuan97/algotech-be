const app = require('../../../index');
const supertest = require('supertest');

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

jest.mock('../../models/bundleCatalogueModel', () => {
  return {
    createBundleCatalogue: jest.fn().mockImplementation(async () => {}),
    getAllBundleCatalogue: jest.fn().mockImplementation(async () => {}),
    updateBundleCatalogue: jest.fn().mockImplementation(async () => {}),
    deleteBundleCatalogue: jest.fn().mockImplementation(async () => {}),
    findBundleCatalogueById: jest.fn().mockImplementation(async () => {})
  };
});

test.skip('Create bundle catalogue', async () => {
  const data = {
    price: 5.0,
    product: {
      sku: 'SKU126',
      name: 'Chocolate Popcorn',
      brandId: 1,
      qtyThreshold: 20,
      id: 4
    },
    description:
      'Combining our favourite dessert with our favourite snack. Meet our take on Chocolate Popcorn!'
  };
  await supertest(app)
    .post('/productCatalogue')
    .set('origin', 'jest')
    .send(data)
    .expect(200)
    .then((response) => {
      expect(response.body).toStrictEqual({
        message: 'Product catalogue created'
      });
    });
});
