const locationModel = require('../../models/locationModel');
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
const location = {
  name: 'Bishan Warehouse',
  address: 'Blk 117 Ang Mo Kio Ave 4 #08-467'
};
jest.mock('../../models/index', () => {
  return {
    prisma: {
      location: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {})
      }
    }
  };
});

test('create location model', async () => {
  prisma.location.create.mockImplementation(async () => {
    return {
      location
    };
  });
  await expect(locationModel.createLocation(location)).resolves.toEqual({
    location
  });
});

test('get all locations', async () => {
  await expect(locationModel.getAllLocations()).resolves.toEqual([]);
});

test('update location', async () => {
  prisma.location.update.mockImplementation(async () => {
    return location;
  });
  await expect(
    locationModel.updateLocations({
      id: 1,
      name: 'warehouse',
      stockQuantity: [
        {
          product: {
            id: 1,
            sku: 'SKU123',
            name: 'Nasi Lemak Popcorn',
            qtyThreshold: 20
          },
          quantity: 50,
          locationName: 'Punggol Warehouse'
        }
      ]
    })
  ).resolves.toEqual(location);
});

test('update location without products', async () => {
  prisma.location.update.mockImplementation(async () => {
    return location;
  });
  await expect(
    locationModel.updateLocationsWithoutProducts({
      id: 1,
      name: 'warehouse',
      address: 'NUS'
    })
  ).resolves.toEqual(location);
});

test('delete location', async () => {
  prisma.location.update.mockImplementation(async () => {
    return location;
  });
  prisma.location.delete.mockImplementation(async () => {
    return {};
  });
  await expect(locationModel.deleteLocation({ id: 1 })).resolves.toEqual({});
});

test('find location by id', async () => {
  prisma.location.findUnique.mockImplementation(async () => {
    return location;
  });
  await expect(locationModel.findLocationById({ id: 1 })).resolves.toEqual(
    location
  );
});

test('find location by name', async () => {
  prisma.location.findUnique.mockImplementation(async () => {
    return location;
  });
  await expect(
    locationModel.findLocationByName({ name: 'delicious' })
  ).resolves.toEqual(location);
});

test('add products to location', async () => {
  prisma.location.update.mockImplementation(async () => {
    return location;
  });
  await expect(
    locationModel.addProductsToLocation({
      id: 1,
      products: [
        {
          id: 1,
          sku: 'SKU123',
          name: 'Nasi Lemak Popcorn',
          quantity: 50
        }
      ]
    })
  ).resolves.toEqual(location);
});
