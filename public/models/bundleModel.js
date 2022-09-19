const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createBundle = async (req) => {
  const { name, description, price, products } = req;

  await prisma.bundle.create({
    data: {
      name,
      description,
      price,
      bundleProduct: {
        create: products.map((p) => ({
          product_sku: p.sku,
          bundle_name: name,
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

const getAllBundles = async () => {
  const bundles = await prisma.bundle.findMany({});
  return bundles;
};

const findBundleById = async (req) => {
  const { id } = req;
  const bundle = await prisma.bundle.findUnique({
    where: {
      id: Number(id)
    }
  });
  return bundle;
};

const findBundleByName = async (req) => {
  const { name } = req;
  const bundle = await prisma.bundle.findUnique({
    where: {
      name
    }
  });
  return bundle;
};

const updateBundle = async (req) => {
  const { id, name, description, price } = req;
  bundle = await prisma.bundle.update({
    where: { id },
    data: {
      name,
      description,
      price
    }
  });
  return bundle;
};

const deleteBundle = async (req) => {
  const { id } = req;
  await prisma.bundle.delete({
    where: {
      id: Number(id)
    },
    data: {
      bundleProduct: {
        deleteMany: {}
      }
    }
  });
};

exports.createBundle = createBundle;
exports.getAllBundles = getAllBundles;
exports.updateBundle = updateBundle;
exports.deleteBundle = deleteBundle;
exports.findBundleById = findBundleById;
exports.findBundleByName = findBundleByName;
