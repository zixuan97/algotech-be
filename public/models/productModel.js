const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProduct = async (req) => {
  const { sku, name, description, image, categories, brand_id } = req;

  await prisma.product.create({
    data: {
      sku,
      name,
      description,
      image,
      brand_id,
      ProductCategory: {
        create: categories.map((c) => ({
          category: {
            connect: {
              name: c.name
            }
          }
        }))
      }
    }
  });
};

const getAllProducts = async () => {
  const products = await prisma.product.findMany({});
  return products;
};

const findProductById = async (req) => {
  const { id } = req;
  const product = await prisma.product.findUnique({
    where: {
      id: Number(id)
    }
  });
  return product;
};

const findProductBySku = async (req) => {
  const { sku } = req;
  const product = await prisma.product.findUnique({
    where: {
      sku
    }
  });
  return product;
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
      id: Number(id)
    }
  });
};

exports.createProduct = createProduct;
exports.getAllProducts = getAllProducts;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.findProductById = findProductById;
exports.findProductBySku = findProductBySku;
