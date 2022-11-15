const { prisma } = require('./index.js');

const createLocation = async (req) => {
  const { name, address } = req;

  return await prisma.location.create({
    data: {
      name,
      address
    }
  });
};

const getAllLocations = async () => {
  const locations = await prisma.location.findMany({
    include: {
      stockQuantity: {
        select: {
          locationId: true,
          product: true,
          quantity: true
        }
      }
    }
  });
  return locations;
};

const updateLocations = async (req) => {
  const { id, name, stockQuantity, address } = req;

  location = await prisma.location.update({
    where: { id },
    data: {
      name,
      address,
      stockQuantity: {
        deleteMany: {},
        create: stockQuantity.map((sq) => ({
          productName: sq.product.name,
          productSku: sq.product.sku,
          quantity: sq.quantity,
          locationName: name,
          product: {
            connect: {
              id: sq.product.id
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
  return await prisma.location.delete({
    where: {
      id: Number(id)
    }
  });
};

const addProductsToLocation = async (req) => {
  const { products, id } = req;
  return await prisma.location.update({
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
    },
    include: {
      stockQuantity: {
        select: {
          locationId: true,
          product: true,
          quantity: true
        }
      }
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
      stockQuantity: {
        select: {
          locationId: true,
          product: true,
          quantity: true
        }
      }
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
