const { prisma } = require('./index.js');

const createBrand = async (req) => {
  const { name } = req;
  return await prisma.brand.create({
    data: {
      name
    }
  });
};

const getAllBrands = async () => {
  const brands = await prisma.brand.findMany({});
  return brands;
};

const updateBrands = async (req) => {
  const { id, name } = req;

  brand = await prisma.brand.update({
    where: { id },
    data: {
      name
    }
  });
  return brand;
};

const deleteBrand = async (req) => {
  const { id } = req;
  return await prisma.brand.delete({
    where: {
      id: Number(id)
    }
  });
};

const findBrandById = async (req) => {
  const { id } = req;
  const brand = await prisma.brand.findUnique({
    where: {
      id: Number(id)
    }
  });
  return brand;
};

const findBrandByName = async (req) => {
  const { name } = req;
  const brand = await prisma.brand.findUnique({
    where: {
      name
    }
  });
  return brand;
};

exports.createBrand = createBrand;
exports.getAllBrands = getAllBrands;
exports.updateBrands = updateBrands;
exports.deleteBrand = deleteBrand;
exports.findBrandById = findBrandById;
exports.findBrandByName = findBrandByName;
