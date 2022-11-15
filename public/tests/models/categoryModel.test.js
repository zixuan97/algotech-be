const categoryModel = require('../../models/categoryModel');
const { prisma } = require('../../models/index');

// mock logger to remove test logs
jest.mock('../../helpers/logger', () => {
  return {
    log: {
      out: jest.fn(),
      debug: jest.fn(),
      error: jest.fn()
    }
  };
});
const category = {
  name: 'popcorn'
};
jest.mock('../../models/index', () => {
  return {
    prisma: {
      category: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {}),
        upsert: jest.fn().mockImplementation(async () => {})
      }
    }
  };
});

test('create category model', async () => {
  prisma.category.create.mockImplementation(async () => {
    return {
      category
    };
  });
  await expect(categoryModel.createCategory(category)).resolves.toEqual({
    category
  });
});

test('get all categories', async () => {
  await expect(categoryModel.getAllCategories()).resolves.toEqual([]);
});

test('update category', async () => {
  prisma.category.update.mockImplementation(async () => {
    return category;
  });
  await expect(categoryModel.updateCategory(category)).resolves.toEqual(
    category
  );
});

test('delete category', async () => {
  prisma.category.update.mockImplementation(async () => {
    return category;
  });
  prisma.category.delete.mockImplementation(async () => {
    return {};
  });
  await expect(categoryModel.deleteCategory({ id: 1 })).resolves.toEqual({});
});

test('find category by id', async () => {
  prisma.category.findUnique.mockImplementation(async () => {
    return category;
  });
  await expect(categoryModel.findCategoryById({ id: 1 })).resolves.toEqual(
    category
  );
});

test('find category by name', async () => {
  prisma.category.findUnique.mockImplementation(async () => {
    return category;
  });
  await expect(
    categoryModel.findCategoryByName({ name: 'delicious' })
  ).resolves.toEqual(category);
});

test('connect or create category', async () => {
  prisma.category.upsert.mockImplementation(async () => {
    return category;
  });
  await expect(
    categoryModel.connectOrCreateCategory({ categories: [{ category }] })
  ).resolves.toEqual([{ status: 'fulfilled', value: undefined }]);
});
