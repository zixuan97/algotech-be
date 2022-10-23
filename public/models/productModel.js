const { prisma } = require('./index.js');

const createProduct = async (req) => {
  const { sku, name, categories, brand, qtyThreshold, stockQuantity } = req;

  await prisma.product.create({
    data: {
      sku,
      name,
      brandId: brand.id,
      qtyThreshold,
      productCategory: {
        create: categories.map((c) => ({
          categoryName: c.name,
          productSku: sku,
          category: {
            connect: {
              name: c.name
            }
          }
        }))
      },
      stockQuantity: {
        create: stockQuantity.map((sq) => ({
          productName: name,
          productSku: sku,
          quantity: sq.quantity,
          locationName: sq.location.name,
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
          productId: true,
          location: true,
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
          productId: true,
          location: true,
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
          productId: true,
          location: true,
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
          productId: true,
          location: true,
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

const findProductsWithNoProdCat = async (req) => {
  const product = await prisma.product.findMany({
    where: {
      productCatalogue: null
    },
    include: {
      productCategory: {
        select: {
          category: true
        }
      },
      stockQuantity: {
        select: {
          productId: true,
          location: true,
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
  const { id, sku, name, categories, brand, qtyThreshold, stockQuantity } = req;
  const product = await prisma.product.update({
    where: { id },
    data: {
      sku,
      name,
      brandId: brand.id,
      qtyThreshold,
      productCategory: {
        deleteMany: {},
        create: categories.map((c) => ({
          categoryName: c.name,
          productSku: sku,
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
          productName: name,
          productSku: sku,
          quantity: sq.quantity,
          locationName: sq.location.name,
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
  const { brandId } = req;
  const products = await prisma.product.findMany({
    where: {
      brandId: Number(brandId)
    },
    include: {
      productCategory: {
        select: {
          category: true
        }
      },
      stockQuantity: {
        select: {
          productId: true,
          location: true,
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

const getAllProductsByBundle = async (req) => {
  const { bundleId } = req;
  const products = await prisma.product.findMany({
    where: {
      bundleProduct: {
        some: {
          bundle: {
            id: Number(bundleId)
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
          productId: true,
          location: true,
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
  const { categoryId } = req;
  const products = await prisma.product.findMany({
    where: {
      productCategory: {
        some: {
          category: {
            id: Number(categoryId)
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
          productId: true,
          location: true,
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
  const { locationId } = req;
  const products = await prisma.product.findMany({
    where: {
      stockQuantity: {
        some: {
          location: {
            id: Number(locationId)
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
          productId: true,
          location: true,
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
exports.getAllProductsByBundle = getAllProductsByBundle;
exports.getAllProductsByLocation = getAllProductsByLocation;
exports.findProductsWithNoProdCat = findProductsWithNoProdCat;
