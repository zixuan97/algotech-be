const app = require('../../../index');
const supertest = require('supertest');

test('Create location', async () => {
  const data = {
    name: 'Punggol Warehouse',
    address: 'Blk 303B Punggol Central #05-792'
  };
  await supertest(app)
    .post('/location')
    .set('origin', 'jest')
    .send(data)
    .expect(200)
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'Location created' });
    });
});

test('Duplicate location should not be created', async () => {
  const data = {
    name: 'Punggol Warehouse',
    address: 'Blk 303B Punggol Central #05-792'
  };
  await supertest(app)
    .post('/location')
    .set('origin', 'jest')
    .send(data)
    .expect(400)
    .then((response) => {
      expect(response.body).toStrictEqual({
        message: 'Location already exists'
      });
    });
});
