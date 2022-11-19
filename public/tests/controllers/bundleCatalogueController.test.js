const app = require('../../../index');
const supertest = require('supertest');
const bundleCatalogueModel = require('../../models/bundleCatalogueModel');
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

jest.mock('../../helpers/s3', () => {
  return {
    uploadS3: jest.fn().mockImplementation(async () => {}),
    getS3: jest.fn().mockImplementation(async () => {}),
    deleteS3: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../models/bundleCatalogueModel', () => {
  return {
    createBundleCatalogue: jest.fn().mockImplementation(async () => {}),
    getAllBundleCatalogue: jest.fn().mockImplementation(async () => []),
    updateBundleCatalogue: jest.fn().mockImplementation(async () => {}),
    deleteBundleCatalogue: jest.fn().mockImplementation(async () => {}),
    findBundleCatalogueById: jest.fn().mockImplementation(async () => {})
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
  },
  image: 'hello'
};

test('Create bundle catalogue', async () => {
  await supertest(app)
    .post('/bundleCatalogue')
    .set('origin', 'jest')
    .send(bundleCatalogue)
    .expect(200);

  const bundleCatalogueNoImage = {
    price: 6.0,
    bundle: {
      id: 1,
      name: 'The Original Mini Pack Popcorn Bundle (Assortment of 8 Packs x 30g) - 1 box',
      description: 'Just a simple description',
      bundleProduct: []
    }
  };
  // no image
  await supertest(app)
    .post('/bundleCatalogue')
    .set('origin', 'jest')
    .send(bundleCatalogueNoImage)
    .expect(200);
});

test('Create bundle catalogue', async () => {
  uploadS3.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/bundleCatalogue')
    .set('origin', 'jest')
    .send(bundleCatalogue)
    .expect(200);
});

test('Create bundle catalogue, error', async () => {
  bundleCatalogueModel.createBundleCatalogue.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .post('/bundleCatalogue')
    .set('origin', 'jest')
    .send(bundleCatalogue)
    .expect(400);
});

test('Get all bundle catalogue', async () => {
  bundleCatalogueModel.getAllBundleCatalogue.mockImplementation(async () => {
    return [
      {
        id: 1,
        price: 34.99,
        bundleId: 4,
        description:
          'For those who love specialty flavours. Cheaper when you buy a bundle!',
        bundle: {
          id: 4,
          name: 'Shiok Ah! Specialty Bundle (6 x 65g)',
          description: '6 x Specialty Popcorn',
          bundleProduct: []
        }
      }
    ];
  });
  await supertest(app)
    .get('/bundleCatalogue/all')
    .set('origin', 'jest')
    .expect(200);
});

test('Get all bundle catalogue, getS3 error', async () => {
  bundleCatalogueModel.getAllBundleCatalogue.mockImplementation(async () => {
    return [
      {
        id: 1,
        price: 34.99,
        bundleId: 4,
        description:
          'For those who love specialty flavours. Cheaper when you buy a bundle!',
        bundle: {
          id: 4,
          name: 'Shiok Ah! Specialty Bundle (6 x 65g)',
          description: '6 x Specialty Popcorn',
          bundleProduct: []
        }
      }
    ];
  });
  getS3.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .get('/bundleCatalogue/all')
    .set('origin', 'jest')
    .expect(200);
});

test('Get all bundle catalogue, get all bundle catalogue error', async () => {
  bundleCatalogueModel.getAllBundleCatalogue.mockImplementation(async () => {
    throw new Error('Model error');
  });
  await supertest(app)
    .get('/bundleCatalogue/all')
    .set('origin', 'jest')
    .expect(400);
});

test('Get bundle catalogue', async () => {
  bundleCatalogueModel.findBundleCatalogueById.mockImplementation(async () => {
    return {
      id: 1,
      price: 34.99,
      bundleId: 4,
      description:
        'For those who love specialty flavours. Cheaper when you buy a bundle!',
      bundle: {
        id: 4,
        name: 'Shiok Ah! Specialty Bundle (6 x 65g)',
        description: '6 x Specialty Popcorn',
        bundleProduct: []
      }
    };
  });
  await supertest(app)
    .get('/bundleCatalogue/id/1')
    .set('origin', 'jest')
    .expect(200);

  getS3.mockImplementation(async () => {});

  await supertest(app)
    .get('/bundleCatalogue/id/1')
    .set('origin', 'jest')
    .expect(200);
});

test('Get bundle catalogue,error', async () => {
  bundleCatalogueModel.findBundleCatalogueById.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .get('/bundleCatalogue/id/1')
    .set('origin', 'jest')
    .expect(400);
});

test('update bundle catalogue', async () => {
  const bundleCatalogueUpdated = {
    id: 1,
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
    },
    image: 'hello'
  };
  bundleCatalogueModel.updateBundleCatalogue.mockImplementation(async () => {
    return bundleCatalogueUpdated;
  });
  await supertest(app)
    .put('/bundleCatalogue')
    .set('origin', 'jest')
    .send(bundleCatalogueUpdated)
    .expect(200);

  // uploads3 no error
  uploadS3.mockImplementation(async () => {});

  await supertest(app)
    .put('/bundleCatalogue')
    .set('origin', 'jest')
    .send(bundleCatalogueUpdated)
    .expect(200);

  // no img
  const bundleCatalogueUpdatedNoImg = {
    id: 1,
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

  await supertest(app)
    .put('/bundleCatalogue')
    .set('origin', 'jest')
    .send(bundleCatalogueUpdatedNoImg)
    .expect(200);
});

test('update bundle catalogue, delete s3 error, update bundle catalogue error', async () => {
  // no img
  const bundleCatalogueUpdatedNoImg = {
    id: 1,
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
  deleteS3.mockImplementation(async () => {
    throw new Error();
  });
  bundleCatalogueModel.updateBundleCatalogue.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .put('/bundleCatalogue')
    .set('origin', 'jest')
    .send(bundleCatalogueUpdatedNoImg)
    .expect(400);
});

test('Delete bundle catalogue', async () => {
  bundleCatalogueModel.findBundleCatalogueById.mockImplementation(async () => {
    return bundleCatalogue;
  });
  deleteS3.mockImplementation(async () => {});

  await supertest(app)
    .delete('/bundleCatalogue/1')
    .set('origin', 'jest')
    .expect(200);
});

test('Delete bundle catalogue,deleteS3 error', async () => {
  bundleCatalogueModel.findBundleCatalogueById.mockImplementation(async () => {
    return bundleCatalogue;
  });
  deleteS3.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .delete('/bundleCatalogue/1')
    .set('origin', 'jest')
    .expect(200);
});

test('Delete bundle catalogue, model error', async () => {
  bundleCatalogueModel.findBundleCatalogueById.mockImplementation(async () => {
    return bundleCatalogue;
  });

  bundleCatalogueModel.deleteBundleCatalogue.mockImplementation(async () => {
    throw new Error();
  });
  deleteS3.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .delete('/bundleCatalogue/1')
    .set('origin', 'jest')
    .expect(400);
});
