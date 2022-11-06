const app = require('../../index');
const supertest = require('supertest');
const brandModel = require('../models/brandModel');

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

jest.mock('../models/brandModel', () => {
  return {
    createBrand: jest.fn().mockImplementation(async () => {}),
    findBrandById: jest.fn().mockImplementation(async () => {}),
    findBrandByName: jest.fn().mockImplementation(async () => {}),
    getAllBrands: jest.fn().mockImplementation(async () => []),
    updateBrands: jest.fn().mockImplementation(async () => {}),
    deleteBrand: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../models/productModel', () => {
  return {
    deleteProduct: jest.fn().mockImplementation(async () => {}),
    getAllProductsByBrand: jest.fn().mockImplementation(async () => [])
  };
});

test('Create brand', async () => {
  const brand = {
    name: 'Delicious'
  };

  brandModel.findBrandById.mockImplementation(async () => {});

  await supertest(app)
    .post('/brand')
    .set('origin', 'jest')
    .send(brand)
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'brand created' });
    });
});

test('Get all brands', async () => {
  await supertest(app)
    .get('/brand/all')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual([]);
    });
});

test('Get one brand by id', async () => {
  brandModel.findBrandById.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .get('/brand/1')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test('Get one brand by name', async () => {
  const brand = {
    name: 'Delicious'
  };

  brandModel.findBrandByName.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .get('/brand')
    .set('origin', 'jest')
    .send(brand)
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test('Update brand', async () => {
  const brand = {
    id: 1,
    name: 'Delicious'
  };
  brandModel.findBrandByName.mockImplementation(async () => {});
  await supertest(app)
    .put('/brand')
    .set('origin', 'jest')
    .send(brand)
    .then((response) => {
      expect(response.body).toStrictEqual({
        message: `Updated brand with id:1`
      });
    });
});

test('Delete brand', async () => {
  brandModel.findBrandByName.mockImplementation(async () => {});
  await supertest(app)
    .delete('/brand/1')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({
        message: `Deleted brand with id:1`
      });
    });
});
