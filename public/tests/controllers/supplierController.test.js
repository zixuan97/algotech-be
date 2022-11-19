const app = require('../../../index');
const supertest = require('supertest');
const supplierModel = require('../../models/supplierModel');
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

jest.mock('../../models/supplierModel', () => {
  return {
    createSupplier: jest.fn().mockImplementation(async () => {}),
    getAllSuppliers: jest.fn().mockImplementation(async () => {}),
    updateSupplier: jest.fn().mockImplementation(async () => {}),
    deleteSupplier: jest.fn().mockImplementation(async () => []),
    findSupplierById: jest.fn().mockImplementation(async () => {}),
    findSupplierByEmail: jest.fn().mockImplementation(async () => {}),
    connectOrCreateSupplierProduct: jest
      .fn()
      .mockImplementation(async () => {}),
    getAllSupplierProducts: jest.fn().mockImplementation(async () => {}),
    findProductsFromSupplier: jest.fn().mockImplementation(async () => {}),
    deleteProductBySupplier: jest.fn().mockImplementation(async () => {}),
    getAllCurrencies: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../models/productModel', () => {
  return {
    findProductById: jest.fn().mockImplementation(async () => {})
  };
});

const product = {
  id: 1,
  sku: 'SKU123',
  name: 'Nasi Lemak Popcorn',
  image: null,
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
};

const supplier = {
  id: 1,
  email: 'tanwk@comp.nus.edu.sg',
  name: 'Wee Kek',
  address: 'Blk 117 Ang Mo Kio Ave 4 #08-467',
  currency: 'SGD - Singapore Dollar',
  supplierProduct: [
    {
      supplierId: 2,
      productId: 2,
      rate: 30,
      product: {
        id: 2,
        sku: 'SKU124',
        name: 'Fish Head Curry Popcorn',
        image: null,
        qtyThreshold: 20,
        brandId: 1,
        productCategory: [
          {
            category: {
              id: 1,
              name: 'Asian Favourites'
            }
          }
        ],
        stockQuantity: [
          {
            productId: 2,
            location: {
              id: 1,
              name: 'Punggol Warehouse',
              address: 'Blk 303B Punggol Central #05-792'
            },
            quantity: 383
          }
        ],
        brand: {
          id: 1,
          name: 'The Kettle Gourmet'
        }
      }
    }
  ]
};

test('Create supplier', async () => {
  supplierModel.findSupplierByEmail.mockImplementation(async () => {});

  supplierModel.createSupplier.mockImplementation(async () => {
    return {
      id: 1,
      email: 'tanwk@comp.nus.edu.sg',
      name: 'Wee Kek',
      address: 'Blk 117 Ang Mo Kio Ave 4 #08-467',
      currency: 'SGD - Singapore Dollar',
      supplierProduct: []
    };
  });
  supplierModel.createSupplier.mockImplementation(async () => {
    return supplier;
  });
  await supertest(app)
    .post('/supplier')
    .set('origin', 'jest')
    .send(supplier)
    .expect(200);
});

test('Create supplier empty supplier products', async () => {
  supplierModel.findSupplierByEmail.mockImplementation(async () => {});

  supplierModel.createSupplier.mockImplementation(async () => {
    return {
      id: 1,
      email: 'tanwk@comp.nus.edu.sg',
      name: 'Wee Kek',
      address: 'Blk 117 Ang Mo Kio Ave 4 #08-467',
      currency: 'SGD - Singapore Dollar',
      supplierProduct: []
    };
  });
  supplierModel.createSupplier.mockImplementation(async () => {
    return supplier;
  });
  await supertest(app)
    .post('/supplier')
    .set('origin', 'jest')
    .send({
      id: 1,
      email: 'tanwk@comp.nus.edu.sg',
      name: 'Wee Kek',
      address: 'Blk 117 Ang Mo Kio Ave 4 #08-467',
      currency: 'SGD - Singapore Dollar',
      supplierProduct: []
    })
    .expect(200);
});

test('Create supplier,error', async () => {
  supplierModel.findSupplierByEmail.mockImplementation(async () => {});
  supplierModel.createSupplier.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/supplier')
    .set('origin', 'jest')
    .send(supplier)
    .expect(400);
});

test('Create supplier,supplier exists', async () => {
  supplierModel.findSupplierByEmail.mockImplementation(async () => {
    return supplier;
  });

  await supertest(app)
    .post('/supplier')
    .set('origin', 'jest')
    .send(supplier)
    .expect(400);
});

test('Get all suppliers', async () => {
  supplierModel.getAllSuppliers.mockImplementation(async () => {
    return [supplier];
  });

  await supertest(app)
    .get('/supplier/all')
    .set('origin', 'jest')
    .send(supplier)
    .expect(200);
});

test('Get all suppliers ,error', async () => {
  supplierModel.getAllSuppliers.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).get('/supplier/all').set('origin', 'jest').expect(400);
});

test('Get supplier by id', async () => {
  supplierModel.findSupplierById.mockImplementation(async () => {
    return supplier;
  });

  await supertest(app).get('/supplier/1').set('origin', 'jest').expect(200);
});

test('Get supplier by id, supplier null', async () => {
  supplierModel.findSupplierById.mockImplementation(async () => {});

  await supertest(app).get('/supplier/1').set('origin', 'jest').expect(400);
});

test('Get supplier by id,error', async () => {
  supplierModel.findSupplierById.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).get('/supplier/1').set('origin', 'jest').expect(400);
});

test('Delete supplier', async () => {
  supplierModel.findProductsFromSupplier.mockImplementation(async () => {
    return Promise.resolve([
      {
        id: 1,
        sku: 'SKU123',
        name: 'Nasi Lemak Popcorn',
        image: null,
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
      }
    ]);
  });
  supplierModel.deleteSupplier.mockImplementation(async () => {});

  await supertest(app).delete('/supplier/1').set('origin', 'jest').expect(200);
});

test('Delete supplier,error', async () => {
  supplierModel.deleteSupplier.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).delete('/supplier/1').set('origin', 'jest').expect(400);
});

test('Delete supplier,find products error', async () => {
  supplierModel.findProductsFromSupplier.mockImplementation(async () => {
    throw new Error();
  });
  supplierModel.deleteSupplier.mockImplementation(async () => {});

  await supertest(app).delete('/supplier/1').set('origin', 'jest').expect(400);
});

test('Delete supplier, delete product by supplier error', async () => {
  supplierModel.findProductsFromSupplier.mockImplementation(async () => {
    return Promise.resolve([
      {
        id: 1,
        sku: 'SKU123',
        name: 'Nasi Lemak Popcorn',
        image: null,
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
      }
    ]);
  });
  supplierModel.deleteSupplier.mockImplementation(async () => {});
  supplierModel.deleteProductBySupplier.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).delete('/supplier/1').set('origin', 'jest').expect(400);
});

test('Update supplier', async () => {
  supplierModel.findSupplierByEmail.mockImplementation(async () => {});

  await supertest(app)
    .put('/supplier')
    .set('origin', 'jest')
    .send(supplier)
    .expect(200);
});

test('Update supplier,error', async () => {
  supplierModel.findSupplierByEmail.mockImplementation(async () => {});
  supplierModel.updateSupplier.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .put('/supplier')
    .set('origin', 'jest')
    .send(supplier)
    .expect(400);
});

test('Add product to supplier', async () => {
  supplierModel.findSupplierById.mockImplementation(async () => {
    return supplier;
  });
  productModel.findProductById.mockImplementation(async () => {
    return product;
  });
  await supertest(app)
    .post('/supplier/addProduct')
    .set('origin', 'jest')
    .send({ supplierId: 1, productId: 1, rate: 2.0 })
    .expect(200);
});

test('Add product to supplier, no product found error', async () => {
  supplierModel.findSupplierById.mockImplementation(async () => {
    return supplier;
  });
  productModel.findProductById.mockImplementation(() => {
    return null;
  });
  await supertest(app)
    .post('/supplier/addProduct')
    .set('origin', 'jest')
    .send({ supplierId: 1, productId: 1, rate: 2.0 })
    .expect(400);
});

test('Add product to supplier', async () => {
  supplierModel.findSupplierById.mockImplementation(async () => {
    return supplier;
  });
  productModel.findProductById.mockImplementation(async () => {
    return product;
  });

  supplierModel.connectOrCreateSupplierProduct.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/supplier/addProduct')
    .set('origin', 'jest')
    .send({ supplierId: 1, productId: 1, rate: 2.0 })
    .expect(400);
});

test('get all supplier products', async () => {
  supplierModel.getAllSupplierProducts.mockImplementation(async () => {
    return [];
  });

  await supertest(app)
    .get('/supplier/products/all')
    .set('origin', 'jest')
    .expect(200);
});

test('get all supplier products', async () => {
  supplierModel.getAllSupplierProducts.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .get('/supplier/products/all')
    .set('origin', 'jest')
    .expect(400);
});

test('get all products by supplier', async () => {
  supplierModel.findProductsFromSupplier.mockImplementation(async () => {
    return [];
  });

  await supertest(app)
    .get('/supplier/products/1')
    .set('origin', 'jest')
    .expect(200);
});

test('get all products by supplier', async () => {
  supplierModel.findProductsFromSupplier.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .get('/supplier/products/1')
    .set('origin', 'jest')
    .expect(400);
});

test('delete product by supplier', async () => {
  supplierModel.deleteProductBySupplier.mockImplementation(async () => {});

  await supertest(app)
    .delete('/supplier/1/1')
    .set('origin', 'jest')
    .expect(200);
});

test('delete product by supplier,error', async () => {
  supplierModel.deleteProductBySupplier.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .delete('/supplier/1/1')
    .set('origin', 'jest')
    .expect(400);
});

test('get all currencies', async () => {
  supplierModel.getAllCurrencies.mockImplementation(async () => {
    return [];
  });

  await supertest(app)
    .get('/supplier/currencies/all')
    .set('origin', 'jest')
    .expect(200);
});
test('get all currencies,error', async () => {
  supplierModel.getAllCurrencies.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .get('/supplier/currencies/all')
    .set('origin', 'jest')
    .expect(400);
});
