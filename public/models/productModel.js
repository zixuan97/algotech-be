const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProduct = async (req) => {
  const { name, description, image, category_id } = req;

  await prisma.product.create({
    data: {
      name,
      description,
      image,
      category_id
    }
  });
};

const getAllProducts = async () => {
  const products = await prisma.product.findMany({});
  return products;
};

const updateProduct = async (req) => {
  const { id, name, description, image, category_id } = req;

  product = await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      image,
      category_id
    }
  });
  return product;
};

const deleteProduct = async (req) => {
  const { id } = req;
  await prisma.product.delete({
    where: {
      id
    }
  });
};

exports.createProduct = createProduct;
exports.getAllProducts = getAllProducts;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
