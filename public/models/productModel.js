const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProduct = async (req) => {
  const {
    sku,
    name,
    description,
    categories,
    brand_id,
    qtyThreshold,
    locations
  } = req;

  await prisma.product.create({
    data: {
      sku,
      name,
      description,
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
      },
      stockQuantity: {
        create: locations.map((l) => ({
          product_name: name,
          product_sku: sku,
          quantity: l.quantity,
          price: l.price,
          location_name: l.name,
          location: {
            connect: {
              id: l.id
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
  const {
    id,
    sku,
    name,
    description,
    image,
    categories,
    brand_id,
    qtyThreshold,
    locations
  } = req;
  const product = await prisma.product.update({
    where: { id },
    data: {
      sku,
      name,
      description,
      image,
      brand_id,
      qtyThreshold,
      productCategory: {
        deleteMany: {},
        create: categories.map((c) => ({
          category_name: c.name,
          product_sku: sku,
          category: {
            connect: {
              name: c.name
            }
          }
        }))
      },
      stockQuantity: {
        deleteMany: {},
        create: locations.map((l) => ({
          product_name: name,
          product_sku: sku,
          quantity: l.quantity,
          price: l.price,
          location_name: l.name,
          location: {
            connect: {
              id: l.id
            }
          }
        }))
      }
    }
  });
  return product;
};

const getAllProductsByBrand = async (req) => {
  const { brand_id } = req;
  const products = await prisma.product.findMany({
    where: {
      brand_id: Number(brand_id)
    }
  });
  return products;
};

const deleteProduct = async (req) => {
  const { id } = req;
  await prisma.product.update({
    where: {
      id: Number(id)
    },
    data: {
      productCategory: {
        deleteMany: {}
      },
      stockQuantity: {
        deleteMany: {}
      },
      bundleProduct: {
        deleteMany: {}
      }
    }
  });
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
exports.getAllProductsByBrand = getAllProductsByBrand;
