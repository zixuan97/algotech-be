const { prisma } = require('./index.js');
const axios = require('axios').default;
const { log } = require('../helpers/logger');

const createSupplier = async (req) => {
  const { email, name, address, currency } = req;
  const supplier = await prisma.supplier.create({
    data: {
      email,
      name,
      address,
      currency
    }
  });
  return supplier;
};

const getAllSuppliers = async () => {
  const suppliers = await prisma.supplier.findMany({
    include: {
      supplierProduct: true
    }
  });
  return suppliers;
};

const findSupplierById = async (req) => {
  const { id } = req;
  const supplier = await prisma.supplier.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      supplierProduct: true
    }
  });
  return supplier;
};

const findSupplierByEmail = async (req) => {
  const { email } = req;
  const supplier = await prisma.supplier.findUnique({
    where: {
      email
    }
  });
  return supplier;
};

const updateSupplier = async (req) => {
  const { id, email, name, address, currency, supplierProduct } = req;
  supplier = await prisma.supplier.update({
    where: { id },
    data: {
      email,
      name,
      address,
      currency,
      supplierProduct: {
        deleteMany: {},
        create: supplierProduct.map((p) => ({
          productId: p.product.id,
          rate: p.rate
        }))
      }
    }
  });
  const supplierPdts = await findProductsFromSupplier({ id });
  const updatedSupplier = {
    ...supplier,
    supplierProduct: supplierPdts
  };
  return updatedSupplier;
};

const deleteSupplier = async (req) => {
  const { id } = req;
  return await prisma.supplier.delete({
    where: {
      id: Number(id)
    }
  });
};

const connectOrCreateSupplierProduct = async (req) => {
  const { supplierId, productId, rate } = req;
  const supplierProduct = await prisma.supplierProduct.upsert({
    where: {
      supplierId_productId: {
        supplierId,
        productId
      }
    },
    update: {
      rate
    },
    create: {
      supplierId,
      productId,
      rate
    }
  });
  return supplierProduct;
};

const getAllSupplierProducts = async () => {
  const supplierProducts = await prisma.supplierProduct.findMany({});
  return supplierProducts;
};

const findProductsFromSupplier = async (req) => {
  const { id } = req;
  const products = await prisma.supplierProduct.findMany({
    where: {
      supplierId: Number(id)
    }
  });
  return products;
};

const deleteProductBySupplier = async (req) => {
  const { supplierId, productId } = req;
  return await prisma.supplierProduct.delete({
    where: {
      supplierId_productId: {
        supplierId: Number(supplierId),
        productId: Number(productId)
      }
    }
  });
};

const getAllCurrencies = async (req) => {
  const url = 'https://openexchangerates.org/api/currencies.json';
  let result = [];
  return await axios.get(url).then((res) => {
    const response = res.data;
    log.out('OK_ORDER_GET-ALL-CURRENCIES');
    for (let key in response) {
      result.push(`${key} - ${response[key]}`);
    }
    return result;
  });
};

exports.createSupplier = createSupplier;
exports.getAllSuppliers = getAllSuppliers;
exports.updateSupplier = updateSupplier;
exports.deleteSupplier = deleteSupplier;
exports.findSupplierById = findSupplierById;
exports.findSupplierByEmail = findSupplierByEmail;
exports.connectOrCreateSupplierProduct = connectOrCreateSupplierProduct;
exports.getAllSupplierProducts = getAllSupplierProducts;
exports.findProductsFromSupplier = findProductsFromSupplier;
exports.deleteProductBySupplier = deleteProductBySupplier;
exports.getAllCurrencies = getAllCurrencies;
