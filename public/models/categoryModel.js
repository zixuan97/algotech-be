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
  const { id, name, description } = req;

  category = await prisma.Category.update({
    where: { id },
    data: {
      name,
      description
    }
  });
  return category;
};

const deleteCategory = async (req) => {
  const { id } = req;
  await prisma.category.delete({
    id
  });
};

exports.create = create;
exports.getAllcategorys = getAllcategorys;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
