const { prisma } = require('./index.js');

const createProdCatalogue = async (req) => {
  const { price, productId, description } = req;

  return await prisma.productCatalogue.create({
    data: {
      price,
      productId,
      description
    }
  });
};

const getAllProdCatalogue = async () => {
  const prodCatalogue = await prisma.productCatalogue.findMany({
    include: {
      product: {
        include: {
          brand: true
        }
      }
    }
  });
  return prodCatalogue;
};

const updateProdCatalogue = async (req) => {
  const { id, price, description } = req;

  prodCatalogue = await prisma.productCatalogue.update({
    where: { id },
    data: {
      price,
      description
    }
  });
  return prodCatalogue;
};

const deleteProdCatalogue = async (req) => {
  const { id } = req;
  return await prisma.productCatalogue.delete({
    where: {
      id: Number(id)
    }
  });
};

const findProdCatalogueById = async (req) => {
  const { id } = req;
  const prodCatalogue = await prisma.productCatalogue.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      product: {
        include: {
          brand: true
        }
      }
    }
  });
  return prodCatalogue;
};

exports.createProdCatalogue = createProdCatalogue;
exports.getAllProdCatalogue = getAllProdCatalogue;
exports.updateProdCatalogue = updateProdCatalogue;
exports.deleteProdCatalogue = deleteProdCatalogue;
exports.findProdCatalogueById = findProdCatalogueById;
