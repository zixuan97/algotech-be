const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createBundle = async (req) => {
  const { name, description, bundleProduct } = req;

  await prisma.bundle.create({
    data: {
      name,
      description,
      bundleProduct: {
        create: bundleProduct.map((bp) => ({
          productSku: bp.product.sku,
          productName: bp.product.name,
          bundleName: name,
          product: {
            connect: {
              id: bp.product.id
            }
          }
        }))
      }
    }
  });
};

const getAllBundles = async () => {
  const bundles = await prisma.bundle.findMany({
    include: {
      bundleProduct: {
        select: {
          product: true,
          productId: true
        }
      }
    }
  });
  return bundles;
};

const findBundleById = async (req) => {
  const { id } = req;
  const bundle = await prisma.bundle.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      bundleProduct: {
        select: {
          product: true,
          productId: true
        }
      }
    }
  });
  return bundle;
};

const findBundleByName = async (req) => {
  const { name } = req;
  const bundle = await prisma.bundle.findUnique({
    where: {
      name
    },
    include: {
      bundleProduct: {
        select: {
          product: true,
          productId: true
        }
      }
    }
  });
  return bundle;
};

const updateBundle = async (req) => {
  const { id, name, description, bundleProduct } = req;
  bundle = await prisma.bundle.update({
    where: { id },
    data: {
      name,
      description,
      bundleProduct: {
        deleteMany :{},
        create: bundleProduct.map((bp) => ({
          productSku: bp.product.sku,
          productName: bp.product.name,
          bundleName: name,
          product: {
            connect: {
              id: bp.product.id
            }
          }
        }))
      }
    }
  });
  return bundle;
};

const deleteBundle = async (req) => {
  const { id } = req;
  await prisma.bundle.update({
    where: {
      id: Number(id)
    },
    data: {
      bundleProduct: {
        deleteMany: {}
      }
    }
  });
  await prisma.bundle.delete({
    where: {
      id: Number(id)
    }
  });
};

exports.createBundle = createBundle;
exports.getAllBundles = getAllBundles;
exports.updateBundle = updateBundle;
exports.deleteBundle = deleteBundle;
exports.findBundleById = findBundleById;
exports.findBundleByName = findBundleByName;
