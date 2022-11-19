const { prisma } = require('./index.js');

const createDiscountCode = async (req) => {
  const {
    discountCode,
    amount,
    startDate,
    endDate,
    customerEmails,
    type,
    minOrderAmount
  } = req;

  return await prisma.discountCode.create({
    data: {
      discountCode,
      amount,
      startDate,
      endDate,
      customerEmails,
      type,
      minOrderAmount
    }
  });
};

const getAllDiscountCodes = async () => {
  const codes = await prisma.discountCode.findMany({});
  return codes;
};

const updateDiscountCode = async (req) => {
  const { id, amount, endDate, customerEmails, type, minOrderAmount } = req;

  code = await prisma.discountCode.update({
    where: { id },
    data: {
      amount,
      endDate,
      customerEmails,
      type,
      minOrderAmount
    }
  });
  return code;
};

const deleteDiscountCode = async (req) => {
  const { id } = req;
  return await prisma.discountCode.delete({
    where: {
      id: Number(id)
    }
  });
};

const findDiscountCodeById = async (req) => {
  const { id } = req;
  const code = await prisma.discountCode.findUnique({
    where: {
      id: Number(id)
    }
  });
  return code;
};

const findDiscountCode = async (req) => {
  const { discountCode } = req;
  const code = await prisma.discountCode.findUnique({
    where: {
      discountCode
    }
  });
  return code;
};

exports.createDiscountCode = createDiscountCode;
exports.getAllDiscountCodes = getAllDiscountCodes;
exports.updateDiscountCode = updateDiscountCode;
exports.deleteDiscountCode = deleteDiscountCode;
exports.findDiscountCodeById = findDiscountCodeById;
exports.findDiscountCode = findDiscountCode;
