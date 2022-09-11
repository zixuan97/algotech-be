const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProduct = async (req) => {
  const { sku, name, description, image, categories, brand_id, qtyThreshold } =
    req;

  await prisma.product.create({
    data: {
      sku,
      name,
      description,
      image,
      brand_id,
      qtyThreshold,
      productCategory: {
        create: categories.map((c) => ({
          category_name: c.name,
          product_sku: sku,
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
  const products = await prisma.product.findMany({
    include: { productCategory: true, stockQuantity: true }
  });
  return products;
};

const findProductById = async (req) => {
  const { id } = req;
  const product = await prisma.product.findUnique({
    where: {
      id: Number(id)
    },
    include: { productCategory: true, stockQuantity: true }
  });
  return product;
};

const findProductBySku = async (req) => {
  const { sku } = req;
  const product = await prisma.product.findUnique({
    where: {
      sku
    },
    include: { productCategory: true, stockQuantity: true }
  });
  return product;
};

const findProductByName = async (req) => {
  const { name } = req;
  const product = await prisma.product.findUnique({
    where: {
      name
    },
    include: { productCategory: true, stockQuantity: true }
  });
  return product;
};

const updateProduct = async (req) => {
  const { id, name, description, image, category_id, qtyThreshold, brand_id } =
    req;
  product = await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      image,
      category_id,
      qtyThreshold,
      brand_id
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
exports.findProductByName = findProductByName;
