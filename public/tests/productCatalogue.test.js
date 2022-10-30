const app = require('../../index');
const supertest = require('supertest');

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

jest.mock('../models/productCatalogueModel', () => {
  return {
    createProdCatalogue: jest.fn().mockImplementation(async () => {}),
    getAllProdCatalogue: jest.fn().mockImplementation(async () => {}),
    updateProdCatalogue: jest.fn().mockImplementation(async () => {}),
    deleteProdCatalogue: jest.fn().mockImplementation(async () => {}),
    findProdCatalogueById: jest.fn().mockImplementation(async () => {})
  };
});

test('Create product catalogue', async () => {
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
