const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCategory = async (req) => {
  const { name } = req;

  await prisma.category.create({
    data: {
      name
    }
  });
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    include: { productCategory: true }
  });
  return categories;
};

const updateCategory = async (req) => {
  const { id, name } = req;

  category = await prisma.category.update({
    where: { id },
    data: {
      name
    }
  });
  return category;
};

const deleteCategory = async (req) => {
  const { id } = req;
  await prisma.category.update({
    where: {
      id: Number(id)
    },
    data: {
      productCategory: {
        deleteMany: {}
      }
    }
  });
  await prisma.category.delete({
    where: {
      id: Number(id)
    }
  });
};

const connectOrCreateCategory = async (req) => {
  const { categories } = req;
  await Promise.allSettled(
    categories.map(async (c) => {
      await prisma.category.upsert({
        where: {
          name: c.name
        },
        update: {},
        create: {
          name: c.name
        }
      });
    })
  );
};

const findCategoryById = async (req) => {
  const { id } = req;
  const category = await prisma.category.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      productCategory: true
    }
  });
  return category;
};

const findCategoryByName = async (req) => {
  const { name } = req;
  const category = await prisma.category.findUnique({
    where: {
      name
    },
    include: {
      productCategory: true
    }
  });
  return category;
};

exports.createCategory = createCategory;
exports.getAllCategories = getAllCategories;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.findCategoryById = findCategoryById;
exports.connectOrCreateCategory = connectOrCreateCategory;
exports.findCategoryByName = findCategoryByName;
