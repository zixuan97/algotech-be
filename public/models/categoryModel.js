const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCategory = async (req) => {
  const { name, description } = req;

  await prisma.category.create({
    data: {
      name,
      description
    }
  });
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({});
  return categories;
};

const updateCategory = async (req) => {
  const { id, name, description } = req;

  category = await prisma.category.update({
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
      id: Number(id)
    }
  });
};

const findCategoryById = async (req) => {
  const { id } = req;
  const category = await prisma.category.findUnique({
    where: {
      id: Number(id)
    }
  });
  return category;
};


exports.createCategory = createCategory;
exports.getAllCategories = getAllCategories;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.findCategoryById = findCategoryById;