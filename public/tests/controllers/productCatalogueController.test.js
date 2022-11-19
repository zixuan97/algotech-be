const app = require('../../../index');
const supertest = require('supertest');
const productCatalogueModel = require('../../models/productCatalogueModel');
const { uploadS3, getS3, deleteS3 } = require('../../helpers/s3');

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

jest.mock('../../models/productCatalogueModel', () => {
  return {
    createProdCatalogue: jest.fn().mockImplementation(async () => {}),
    getAllProdCatalogue: jest.fn().mockImplementation(async () => {}),
    updateProdCatalogue: jest.fn().mockImplementation(async () => {}),
    deleteProdCatalogue: jest.fn().mockImplementation(async () => {}),
    findProdCatalogueById: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../helpers/s3', () => {
  return {
    uploadS3: jest.fn().mockImplementation(async () => {}),
    getS3: jest.fn().mockImplementation(async () => {}),
    deleteS3: jest.fn().mockImplementation(async () => {})
  };
});

const productCatalogue = {
  id: 1,
  price: 5.0,
  productId: 1,
  image: 'hello',
  description:
    "Our signature flavour. You won't be able to tell the difference between this and the real thing!",
  product: {
    id: 1,
    sku: 'SKU123',
    name: 'Nasi Lemak Popcorn',
    image: null,
    qtyThreshold: 20,
    brandId: 1,
    brand: {
      id: 1,
      name: 'The Kettle Gourmet'
    }
  }
};

test('Create product catalogue', async () => {
  uploadS3.mockImplementation(async () => {});
  await supertest(app)
    .post('/productCatalogue')
    .set('origin', 'jest')
    .send(productCatalogue)
    .expect(200);

  // no img
  const productCatalogueNoImg = {
    price: 5.0,
    productId: 1,
    description:
      "Our signature flavour. You won't be able to tell the difference between this and the real thing!",
    product: {
      id: 1,
      sku: 'SKU123',
      name: 'Nasi Lemak Popcorn',
      image: null,
      qtyThreshold: 20,
      brandId: 1,
      brand: {
        id: 1,
        name: 'The Kettle Gourmet'
      }
    }
  };
  await supertest(app)
    .post('/productCatalogue')
    .set('origin', 'jest')
    .send(productCatalogueNoImg)
    .expect(200);
});

test('Create product catalogue, upload S3 error', async () => {
  uploadS3.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/productCatalogue')
    .set('origin', 'jest')
    .send(productCatalogue)
    .expect(200);
});

test('Create product catalogue, create product catalogue error', async () => {
  uploadS3.mockImplementation(async () => {});
  productCatalogueModel.createProdCatalogue.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/productCatalogue')
    .set('origin', 'jest')
    .send(productCatalogue)
    .expect(400);
});

test('Get all product catalogue', async () => {
  productCatalogueModel.getAllProdCatalogue.mockImplementation(async () => {
    return [productCatalogue];
  });
  await supertest(app)
    .get('/productCatalogue/all')
    .set('origin', 'jest')
    .expect(200);
});

test('Get all product catalogue, getS3 error', async () => {
  productCatalogueModel.getAllProdCatalogue.mockImplementation(async () => {
    return [productCatalogue];
  });
  getS3.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .get('/productCatalogue/all')
    .set('origin', 'jest')
    .expect(200);
});

test('Get all product catalogue, get all product catalogue error', async () => {
  productCatalogueModel.getAllProdCatalogue.mockImplementation(async () => {
    throw new Error('Model error');
  });
  await supertest(app)
    .get('/productCatalogue/all')
    .set('origin', 'jest')
    .send(productCatalogue)
    .expect(400);
});

test('Get product catalogue', async () => {
  productCatalogueModel.findProdCatalogueById.mockImplementation(async () => {
    return productCatalogue;
  });

  await supertest(app)
    .get('/productCatalogue/id/1')
    .set('origin', 'jest')
    .expect(200);

  getS3.mockImplementation(async () => {});

  await supertest(app)
    .get('/productCatalogue/id/1')
    .set('origin', 'jest')
    .expect(200);
});

test('Get product catalogue,error', async () => {
  productCatalogueModel.findProdCatalogueById.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .get('/productCatalogue/id/1')
    .set('origin', 'jest')
    .send(productCatalogue)
    .expect(400);
});

test('update product catalogue', async () => {
  productCatalogueModel.updateProdCatalogue.mockImplementation(async () => {
    return productCatalogue;
  });

  uploadS3.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .put('/productCatalogue')
    .set('origin', 'jest')
    .send({
      price: 5.0,
      productId: 1,
      image: 'hello',
      description:
        "Our signature flavour. You won't be able to tell the difference between this and the real thing!",
      product: {
        id: 1,
        sku: 'SKU123',
        name: 'Nasi Lemak Popcorn',
        image: null,
        qtyThreshold: 20,
        brandId: 1,
        brand: {
          id: 1,
          name: 'The Kettle Gourmet'
        }
      }
    })
    .expect(200);

  // uploads3 no error
  uploadS3.mockImplementation(async () => {});

  await supertest(app)
    .put('/productCatalogue')
    .set('origin', 'jest')
    .send({
      price: 5.0,
      productId: 1,
      image: 'hello',
      description:
        "Our signature flavour. You won't be able to tell the difference between this and the real thing!",
      product: {
        id: 1,
        sku: 'SKU123',
        name: 'Nasi Lemak Popcorn',
        image: null,
        qtyThreshold: 20,
        brandId: 1,
        brand: {
          id: 1,
          name: 'The Kettle Gourmet'
        }
      }
    })
    .expect(200);

  // no img
  const productCatalogueNoImg = {
    price: 5.0,
    productId: 1,
    description:
      "Our signature flavour. You won't be able to tell the difference between this and the real thing!",
    product: {
      id: 1,
      sku: 'SKU123',
      name: 'Nasi Lemak Popcorn',
      image: null,
      qtyThreshold: 20,
      brandId: 1,
      brand: {
        id: 1,
        name: 'The Kettle Gourmet'
      }
    }
  };

  await supertest(app)
    .put('/productCatalogue')
    .set('origin', 'jest')
    .send(productCatalogueNoImg)
    .expect(200);
});

test('update product catalogue, delete s3 error, update product catalogue error', async () => {
  // no img
  const productCatalogueNoImg = {
    price: 5.0,
    productId: 1,
    description:
      "Our signature flavour. You won't be able to tell the difference between this and the real thing!",
    product: {
      id: 1,
      sku: 'SKU123',
      name: 'Nasi Lemak Popcorn',
      image: null,
      qtyThreshold: 20,
      brandId: 1,
      brand: {
        id: 1,
        name: 'The Kettle Gourmet'
      }
    }
  };
  deleteS3.mockImplementation(async () => {
    throw new Error();
  });
  productCatalogueModel.updateProdCatalogue.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .put('/productCatalogue')
    .set('origin', 'jest')
    .send(productCatalogueNoImg)
    .expect(400);
});

test('Delete product catalogue', async () => {
  productCatalogueModel.findProdCatalogueById.mockImplementation(async () => {
    return productCatalogue;
  });
  deleteS3.mockImplementation(async () => {});

  await supertest(app)
    .delete('/productCatalogue/1')
    .set('origin', 'jest')
    .send(productCatalogue)
    .expect(200);
});

test('Delete product catalogue,deleteS3 error', async () => {
  productCatalogueModel.findProdCatalogueById.mockImplementation(async () => {
    return productCatalogue;
  });
  deleteS3.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .delete('/productCatalogue/1')
    .set('origin', 'jest')
    .send(productCatalogue)
    .expect(200);
});

test('Delete product catalogue, model error', async () => {
  productCatalogueModel.findProdCatalogueById.mockImplementation(async () => {
    return productCatalogue;
  });

  productCatalogueModel.deleteProdCatalogue.mockImplementation(async () => {
    throw new Error();
  });
  deleteS3.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .delete('/productCatalogue/1')
    .set('origin', 'jest')
    .send(productCatalogue)
    .expect(400);
});
