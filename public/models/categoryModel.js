const common = require('@kelchy/common');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const create = async (req) => {
  const { name, description } = req;

  await prisma.Category.create({
    data: {
      name,
      description
    }
  });
};

const getAllcategorys = async () => {
  const categorys = await prisma.Category.findMany({});
  return categorys;
};

const updateCategory = async (req) => {
  const { name, description } = req.body;
  await prisma.Category.update({
    name,
    description
  });
};

exports.create = create;
exports.getAllcategorys = getAllcategorys;
