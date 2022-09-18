const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProduct = async (req) => {
  const {
    sku,
    name,
    description,
    categories,
    brand,
    qtyThreshold,
    stockQuantity
  } = req;

  await prisma.product.create({
    data: {
      sku,
      name,
      description,
      brand_id: brand.id,
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
        create: stockQuantity.map((sq) => ({
          product_name: name,
          product_sku: sku,
          quantity: sq.quantity,
          price: sq.price,
          location_name: sq.location.name,
          location: {
            connect: {
              id: sq.location.id
            }
          }
        }))
      }
    }
  });
};

const getAllProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      productCategory: {
        select: {
          category: true
        }
      },
      stockQuantity: {
        select: {
          location: true,
          price: true,
          quantity: true
        }
      },
      brand: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  return products;
};

const findProductById = async (req) => {
  const { id } = req;
  const product = await prisma.product.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      productCategory: {
        select: {
          category: true
        }
      },
      stockQuantity: {
        select: {
          location: true,
          price: true,
          quantity: true
        }
      },
      brand: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  return product;
};

const findProductBySku = async (req) => {
  const { sku } = req;
  const product = await prisma.product.findUnique({
    where: {
      sku
    },
    include: {
      productCategory: {
        select: {
          category: true
        }
      },
      stockQuantity: {
        select: {
          location: true,
          price: true,
          quantity: true
        }
      },
      brand: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  return product;
};

const findProductByName = async (req) => {
  const { name } = req;
  const product = await prisma.product.findUnique({
    where: {
      name
    },
    include: {
      productCategory: {
        select: {
          category: true
        }
      },
      stockQuantity: {
        select: {
          location: true,
          price: true,
          quantity: true
        }
      },
      brand: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  return product;
};

const updateProduct = async (req) => {
  const {
    id,
    sku,
    name,
    description,
    categories,
    brand,
    qtyThreshold,
    stockQuantity
  } = req;
  const product = await prisma.product.update({
    where: { id },
    data: {
      sku,
      name,
      description,
      brand_id: brand.id,
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
        create: stockQuantity.map((sq) => ({
          product_name: name,
          product_sku: sku,
          quantity: sq.quantity,
          price: sq.price,
          location_name: sq.location.name,
          location: {
            connect: {
              id: sq.location.id
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
    },
    include: {
      productCategory: {
        select: {
          category: true
        }
      },
      stockQuantity: {
        select: {
          location: true,
          price: true,
          quantity: true
        }
      },
      brand: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  return products;
};

const getAllProductsByCategory = async (req) => {
  const { category_id } = req;
  const products = await prisma.product.findMany({
    where: {
      productCategory: {
        every: {
          category: {
            id: Number(category_id)
          }
        }
      }
    },
    include: {
      productCategory: {
        select: {
          category: true
        }
      },
      stockQuantity: {
        select: {
          location: true,
          price: true,
          quantity: true
        }
      },
      brand: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  return products;
};
const getAllProductsByLocation = async (req) => {
  const { location_id } = req;
  const products = await prisma.product.findMany({
    where: {
      stockQuantity: {
        every: {
          location: {
            id: Number(location_id)
          }
        }
      }
    },
    include: {
      productCategory: {
        select: {
          category: true
        }
      },
      stockQuantity: {
        select: {
          location: true,
          price: true,
          quantity: true
        }
      },
      brand: {
        select: {
          id: true,
          name: true
        }
      }
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
exports.getAllProductsByCategory = getAllProductsByCategory;
exports.getAllProductsByLocation = getAllProductsByLocation;
