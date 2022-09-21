const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createLocation = async (req) => {
  const { name, address } = req;

  await prisma.location.create({
    data: {
      name,
      address
    }
  });
};

const getAllLocations = async () => {
  const locations = await prisma.location.findMany({});
  return locations;
};

const updateLocations = async (req) => {
  const { id, name, products, address } = req;

  location = await prisma.location.update({
    where: { id },
    data: {
      name,
      address,
      stockQuantity: {
        deleteMany: {},
        create: products.map((p) => ({
          productSku: p.sku,
          productName: p.name,
          quantity: p.quantity,
          product: {
            connect: {
              id: p.id
            }
          }
        }))
      }
    }
  });
  return location;
};

const updateLocationsWithoutProducts = async (req) => {
  const { id, name, address } = req;

  location = await prisma.location.update({
    where: { id },
    data: {
      name,
      address
    }
  });
  return location;
};

const deleteLocation = async (req) => {
  const { id } = req;
  await prisma.location.update({
    where: {
      id: Number(id)
    },
    data: {
      stockQuantity: {
        deleteMany: {}
      }
    }
  });
  await prisma.location.delete({
    where: {
      id: Number(id)
    }
  });
};

const addProductsToLocation = async (req) => {
  const { products, id } = req;
  await prisma.location.update({
    where: { id },
    data: {
      stockQuantity: {
        create: products.map((p) => ({
          productSku: p.sku,
          productName: p.name,
          quantity: p.quantity,
          product: {
            connect: {
              id: p.id
            }
          }
        }))
      }
    }
  });
};

const findLocationById = async (req) => {
  const { id } = req;
  const location = await prisma.location.findUnique({
    where: {
      id: Number(id)
    }
  });
  return location;
};

const findLocationByName = async (req) => {
  const { name } = req;
  const location = await prisma.location.findUnique({
    where: {
      name
    }
  });
  return location;
};

exports.createLocation = createLocation;
exports.getAllLocations = getAllLocations;
exports.updateLocations = updateLocations;
exports.deleteLocation = deleteLocation;
exports.findLocationById = findLocationById;
exports.findLocationByName = findLocationByName;
exports.addProductsToLocation = addProductsToLocation;
exports.updateLocationsWithoutProducts = updateLocationsWithoutProducts;
