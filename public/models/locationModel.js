const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createLocation = async (req) => {
  const { name } = req;

  await prisma.location.create({
    data: {
      name
    }
  });
};

const getAllLocations = async () => {
  const locations = await prisma.location.findMany({
    include: { stockQuantity: true }
  });
  return locations;
};

const updateLocations = async (req) => {
  const { id, name, products } = req;

  location = await prisma.location.update({
    where: { id },
    data: {
      name,
      stockQuantity: {
        deleteMany: {},
        create: products.map((p) => ({
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

const deleteLocation = async (req) => {
  const { id } = req;
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
          product_sku: p.sku,
          product_name: p.name,
          price: p.price,
          quantity: p.quantity,
          product_qtyThreshold: p.qtyThreshold,
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
    },
    include: {
      stockQuantity: true
    }
  });
  return location;
};

const findLocationByName = async (req) => {
  const { name } = req;
  const location = await prisma.location.findUnique({
    where: {
      name
    },
    include: {
      stockQuantity: true
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
