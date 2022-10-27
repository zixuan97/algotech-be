const app = require('../../../index');
const supertest = require('supertest');

test('Create category', async () => {
  const data = {
    name: 'Asian Favourites'
  };
  await supertest(app)
    .post('/category')
    .set('origin', 'jest')
    .send(data)
    .expect(200)
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'Category created' });
    });
});

test('Duplicate category should not be created', async () => {
  const data = {
    name: 'Asian Favourites'
  };
  await supertest(app)
    .post('/category')
    .set('origin', 'jest')
    .send(data)
    .expect(400)
    .then((response) => {
      expect(response.body).toStrictEqual({
        message: 'Category already exists'
      });
    });
});
