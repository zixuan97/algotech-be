const app = require('../../../index');
const supertest = require('supertest');
const locationModel = require('../../models/locationModel');

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

jest.mock('../../models/locationModel', () => {
  return {
    createLocation: jest.fn().mockImplementation(async () => {}),
    getAllLocations: jest.fn().mockImplementation(async () => {}),
    updateLocations: jest.fn().mockImplementation(async () => {}),
    deleteLocation: jest.fn().mockImplementation(async () => []),
    findLocationById: jest.fn().mockImplementation(async () => {}),
    findLocationByName: jest.fn().mockImplementation(async () => {}),
    addProductsToLocation: jest.fn().mockImplementation(async () => {}),
    updateLocationsWithoutProducts: jest.fn().mockImplementation(async () => {})
  };
});

const location = {
  name: 'zac house2',
  address: 'blk 303b'
};

test('Create location', async () => {
  locationModel.findLocationByName.mockImplementation(async () => {});

  await supertest(app)
    .post('/location')
    .set('origin', 'jest')
    .send(location)
    .expect(200);
});

test('Create location,error', async () => {
  locationModel.findLocationByName.mockImplementation(async () => {});
  locationModel.createLocation.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/location')
    .set('origin', 'jest')
    .send(location)
    .expect(400);
});

test('Create location,location exists', async () => {
  locationModel.findLocationByName.mockImplementation(async () => {
    return location;
  });

  await supertest(app)
    .post('/location')
    .set('origin', 'jest')
    .send(location)
    .expect(400);
});

test('Create location,find location name error exists', async () => {
  locationModel.findLocationByName.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .post('/location')
    .set('origin', 'jest')
    .send(location)
    .expect(400);
});

test('Get all locations', async () => {
  locationModel.getAllLocations.mockImplementation(async () => {});

  await supertest(app)
    .get('/location/all')
    .set('origin', 'jest')
    .send(location)
    .expect(200);
});

test('Get all locations,error', async () => {
  locationModel.getAllLocations.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).get('/location/all').set('origin', 'jest').expect(400);
});

test('Get location by id', async () => {
  locationModel.findLocationById.mockImplementation(async () => {});

  await supertest(app).get('/location/1').set('origin', 'jest').expect(200);
});

test('Get location by id,error', async () => {
  locationModel.findLocationById.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).get('/location/1').set('origin', 'jest').expect(400);
});

test('Get location by name', async () => {
  locationModel.findLocationByName.mockImplementation(async () => {});

  await supertest(app)
    .get('/location')
    .set('origin', 'jest')
    .send(location)
    .expect(200);
});

test('Get location by name,error', async () => {
  locationModel.findLocationByName.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).get('/location').set('origin', 'jest').expect(400);
});

test('Delete location', async () => {
  locationModel.deleteLocation.mockImplementation(async () => {});

  await supertest(app).delete('/location/1').set('origin', 'jest').expect(200);
});

test('Delete location,error', async () => {
  locationModel.deleteLocation.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).delete('/location/1').set('origin', 'jest').expect(400);
});

test('Update location', async () => {
  locationModel.findLocationByName.mockImplementation(async () => {});

  await supertest(app)
    .put('/location')
    .set('origin', 'jest')
    .send(location)
    .expect(200);
});

test('Update location, find location by name error', async () => {
  locationModel.findLocationByName.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .put('/location')
    .set('origin', 'jest')
    .send(location)
    .expect(400);
});

test('Update location, location exists', async () => {
  const locationUpdated = {
    id: 1,
    name: 'zac house2',
    address: 'blk 303b'
  };
  locationModel.findLocationByName.mockImplementation(async () => {
    return locationUpdated;
  });
  location.id = 2;
  await supertest(app)
    .put('/location')
    .set('origin', 'jest')
    .send(location)
    .expect(400);
});

test('Update location,error', async () => {
  locationModel.findLocationByName.mockImplementation(async () => {});
  locationModel.updateLocations.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .put('/location')
    .set('origin', 'jest')
    .send(location)
    .expect(400);
});

test('Update location without products', async () => {
  locationModel.findLocationByName.mockImplementation(async () => {});

  await supertest(app)
    .put('/location/noproduct')
    .set('origin', 'jest')
    .send(location)
    .expect(200);
});

test('Update location without products,find location by name error', async () => {
  locationModel.findLocationByName.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .put('/location/noproduct')
    .set('origin', 'jest')
    .send(location)
    .expect(400);
});

test('Update location, location exists', async () => {
  const locationUpdated = {
    id: 1,
    name: 'zac house2',
    address: 'blk 303b'
  };
  locationModel.findLocationByName.mockImplementation(async () => {
    return locationUpdated;
  });
  location.id = 2;
  await supertest(app)
    .put('/location/noproduct')
    .set('origin', 'jest')
    .send(location)
    .expect(400);
});

test('Update location without products', async () => {
  locationModel.findLocationByName.mockImplementation(async () => {});
  locationModel.updateLocationsWithoutProducts.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .put('/location/noproduct')
    .set('origin', 'jest')
    .send(location)
    .expect(400);
});

test('Add products to location', async () => {
  locationModel.addProductsToLocation.mockImplementation(async () => {});

  await supertest(app)
    .post('/location/products/all')
    .set('origin', 'jest')
    .send(location)
    .expect(200);
});

test('Add products to location', async () => {
  locationModel.addProductsToLocation.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .post('/location/products/all')
    .set('origin', 'jest')
    .send(location)
    .expect(400);
});
