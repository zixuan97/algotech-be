const app = require('../../../index');
const supertest = require('supertest');
const categoryModel = require('../../models/categoryModel');

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

jest.mock('../../models/categoryModel', () => {
  return {
    createCategory: jest.fn().mockImplementation(async () => {}),
    getAllCategories: jest.fn().mockImplementation(async () => {}),
    updateCategory: jest.fn().mockImplementation(async () => {}),
    deleteCategory: jest.fn().mockImplementation(async () => []),
    findCategoryById: jest.fn().mockImplementation(async () => {}),
    connectOrCreateCategory: jest.fn().mockImplementation(async () => {}),
    findCategoryByName: jest.fn().mockImplementation(async () => {})
  };
});

const category = {
  name: 'popcorn'
};

test('Create category', async () => {
  categoryModel.findCategoryByName.mockImplementation(async () => {});

  await supertest(app)
    .post('/category')
    .set('origin', 'jest')
    .send(category)
    .expect(200);
});

test('Create category,error', async () => {
  categoryModel.findCategoryByName.mockImplementation(async () => {});
  categoryModel.createCategory.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/category')
    .set('origin', 'jest')
    .send(category)
    .expect(400);
});

test('Create category,category exists', async () => {
  categoryModel.findCategoryByName.mockImplementation(async () => {
    return category;
  });

  await supertest(app)
    .post('/category')
    .set('origin', 'jest')
    .send(category)
    .expect(400);
});

test('Get all categories', async () => {
  categoryModel.getAllCategories.mockImplementation(async () => {});

  await supertest(app)
    .get('/category/all')
    .set('origin', 'jest')
    .send(category)
    .expect(200);
});

test('Get all categories,error', async () => {
  categoryModel.getAllCategories.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).get('/category/all').set('origin', 'jest').expect(400);
});

test('Get category by id', async () => {
  categoryModel.findCategoryById.mockImplementation(async () => {});

  await supertest(app).get('/category/1').set('origin', 'jest').expect(200);
});

test('Get category by id,error', async () => {
  categoryModel.findCategoryById.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).get('/category/1').set('origin', 'jest').expect(400);
});

test('Get category by name', async () => {
  categoryModel.findCategoryByName.mockImplementation(async () => {});

  await supertest(app)
    .get('/category')
    .set('origin', 'jest')
    .send({ category })
    .expect(200);
});

test('Get category by name,error', async () => {
  categoryModel.findCategoryByName.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).get('/category').set('origin', 'jest').expect(400);
});

test('Delete category', async () => {
  categoryModel.deleteCategory.mockImplementation(async () => {});

  await supertest(app).delete('/category/1').set('origin', 'jest').expect(200);
});

test('Delete category,error', async () => {
  categoryModel.deleteCategory.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).delete('/category/1').set('origin', 'jest').expect(400);
});

test('Update category', async () => {
  categoryModel.findCategoryByName.mockImplementation(async () => {});

  await supertest(app)
    .put('/category')
    .set('origin', 'jest')
    .send(category)
    .expect(200);
});

test('Update category, category exists', async () => {
  const categoryUpdated = {
    id: 1,
    name: 'popcorn'
  };
  categoryModel.findCategoryByName.mockImplementation(async () => {
    return categoryUpdated;
  });
  category.id = 2;
  await supertest(app)
    .put('/category')
    .set('origin', 'jest')
    .send(category)
    .expect(400);
});

test('Update category,error', async () => {
  categoryModel.findCategoryByName.mockImplementation(async () => {});
  categoryModel.updateCategory.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .put('/category')
    .set('origin', 'jest')
    .send(category)
    .expect(400);
});
