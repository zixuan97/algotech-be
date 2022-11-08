const { prisma } = require('./index.js');

const createDiscountCode = async (req) => {
  const { discountCode, amount, startDate, endDate, customerEmails, type } =
    req;

  await prisma.discountCode.create({
    data: {
      discountCode,
      amount,
      startDate,
      endDate,
      customerEmails,
      type
    }
  });
};

const getAllDiscountCodes = async () => {
  const discountCodes = await prisma.discountCode.findMany({});
  return discountCodes;
};

const updateDiscountCode = async (req) => {
  const { id, discountCode, amount, startDate, endDate, customerEmails, type } =
    req;

  discountCode = await prisma.discountCode.update({
    where: { id },
    data: {
      discountCode,
      amount,
      startDate,
      endDate,
      customerEmails,
      type
    }
  });
  return discountCode;
};

const deleteBrand = async (req) => {
  const { id } = req;
  await prisma.brand.delete({
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
