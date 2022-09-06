const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCategory = async (req) => {
  const { name, description } = req;

  await prisma.Category.create({
    data: {
      name,
      description
    }
  });
};

const getAllCategories = async () => {
  const categories = await prisma.Category.findMany({});
  return categories;
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
    where: {
      id
    }
  });
};

exports.createCategory = createCategory;
exports.getAllCategories = getAllCategories;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
