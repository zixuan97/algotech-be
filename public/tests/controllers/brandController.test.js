const app = require('../../../index');
const supertest = require('supertest');
const brandModel = require('../../models/brandModel');
const productModel = require('../../models/productModel');

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

jest.mock('../../models/brandModel', () => {
  return {
    createBrand: jest.fn().mockImplementation(async () => {}),
    findBrandById: jest.fn().mockImplementation(async () => {}),
    findBrandByName: jest.fn().mockImplementation(async () => {}),
    getAllBrands: jest.fn().mockImplementation(async () => []),
    updateBrands: jest.fn().mockImplementation(async () => {}),
    deleteBrand: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../models/productModel', () => {
  return {
    deleteProduct: jest.fn().mockImplementation(async () => {}),
    getAllProductsByBrand: jest.fn().mockImplementation(async () => {})
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
    .expect(200);
});

test('Create brand, name already exists', async () => {
  const brand = {
    name: 'Delicious'
  };

  brandModel.findBrandByName.mockImplementation(async () => {
    return {};
  });

  await supertest(app)
    .post('/brand')
    .set('origin', 'jest')
    .send(brand)
    .expect(400);
});

test('Create brand, check if name already exists throw error', async () => {
  const brand = {
    name: 'Delicious'
  };

  brandModel.findBrandByName.mockImplementation(async () => {
    throw new Error('Prisma brand error');
  });

  await supertest(app)
    .post('/brand')
    .set('origin', 'jest')
    .send(brand)
    .expect(400);
});

test('Create brand error', async () => {
  const brand = {
    name: 'Delicious'
  };
  brandModel.findBrandByName.mockImplementation(async () => {});

  brandModel.createBrand.mockImplementation(async () => {
    throw new Error('Error creating brand');
  });

  await supertest(app)
    .post('/brand')
    .set('origin', 'jest')
    .send(brand)
    .expect(400);
});

test('Get all brands', async () => {
  await supertest(app).get('/brand/all').set('origin', 'jest').expect(200);
});

test('Get all brands, prisma error', async () => {
  brandModel.getAllBrands.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app).get('/brand/all').set('origin', 'jest').expect(400);
});

test('Get one brand by id', async () => {
  brandModel.findBrandById.mockImplementation(async () => {
    return {};
  });
  await supertest(app).get('/brand/1').set('origin', 'jest').expect(200);
});

test('Get one brand by id, prisma error', async () => {
  brandModel.findBrandById.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).get('/brand/1').set('origin', 'jest').expect(400);
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
    .expect(200);
});

test('Get one brand by name, prisma error', async () => {
  const brand = {
    name: 'Delicious'
  };

  brandModel.findBrandByName.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .get('/brand')
    .set('origin', 'jest')
    .send(brand)
    .expect(400);
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
    .expect(200);
});

test('Update brand, brand name already exists', async () => {
  const brand = {
    id: 1,
    name: 'Delicious'
  };
  brandModel.findBrandByName.mockImplementation(async () => {
    return {
      id: 2,
      name: 'Delicious'
    };
  });
  await supertest(app)
    .put('/brand')
    .set('origin', 'jest')
    .send(brand)
    .expect(400);
});

test('Update brand, brand name already exists prisma error', async () => {
  const brand = {
    id: 1,
    name: 'Delicious'
  };
  brandModel.findBrandByName.mockImplementation(async () => {
    throw new Error('Prisma error');
  });
  await supertest(app)
    .put('/brand')
    .set('origin', 'jest')
    .send(brand)
    .expect(400);
});

test('Update brand, prisma error', async () => {
  const brand = {
    id: 1,
    name: 'Delicious'
  };
  brandModel.findBrandByName.mockImplementation(async () => {});

  brandModel.updateBrands.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .put('/brand')
    .set('origin', 'jest')
    .send(brand)
    .expect(400);
});

test('Delete brand', async () => {
  brandModel.deleteBrand.mockImplementation(async () => {});
  productModel.getAllProductsByBrand.mockImplementation(async () => {
    return [
      {
        sku: 'SKU192',
        name: 'testing',
        brand: { id: 1, name: 'The Kettle Gourmet' },
        qtyThreshold: 20,
        categories: [{ id: 1, name: 'Asian Favourites' }],
        stockQuantity: [
          {
            location: {
              id: 1,
              name: 'Punggol Warehouse',
              address: 'Blk 303B Punggol Central #05-792'
            },
            price: 4.5,
            quantity: 20
          }
        ]
      }
    ];
  });
  await supertest(app).delete('/brand/1').set('origin', 'jest').expect(200);
});

test('Delete brand, get all products by brand prisma error', async () => {
  productModel.getAllProductsByBrand.mockImplementation(async () => {
    throw new Error('prisma error');
  });
  await supertest(app).delete('/brand/1').set('origin', 'jest').expect(400);
});

test('Delete brand, delete product prisma error', async () => {
  brandModel.deleteBrand.mockImplementation(async () => {});
  productModel.getAllProductsByBrand.mockImplementation(async () => {
    return [
      {
        sku: 'SKU192',
        name: 'testing',
        brand: { id: 1, name: 'The Kettle Gourmet' },
        qtyThreshold: 20,
        categories: [{ id: 1, name: 'Asian Favourites' }],
        stockQuantity: [
          {
            location: {
              id: 1,
              name: 'Punggol Warehouse',
              address: 'Blk 303B Punggol Central #05-792'
            },
            price: 4.5,
            quantity: 20
          }
        ]
      }
    ];
  });
  productModel.deleteProduct.mockImplementation(async () => {
    throw new Error('prisma error');
  });
  await supertest(app).delete('/brand/1').set('origin', 'jest').expect(400);
});

test('Delete brand, delete brand error', async () => {
  brandModel.deleteBrand.mockImplementation(async () => {
    throw new Error();
  });
  productModel.deleteProduct.mockImplementation(async () => {});
  productModel.getAllProductsByBrand.mockImplementation(async () => {
    return [
      {
        sku: 'SKU192',
        name: 'testing',
        brand: { id: 1, name: 'The Kettle Gourmet' },
        qtyThreshold: 20,
        categories: [{ id: 1, name: 'Asian Favourites' }],
        stockQuantity: [
          {
            location: {
              id: 1,
              name: 'Punggol Warehouse',
              address: 'Blk 303B Punggol Central #05-792'
            },
            price: 4.5,
            quantity: 20
          }
        ]
      }
    ];
  });
  await supertest(app).delete('/brand/1').set('origin', 'jest').expect(400);
});
