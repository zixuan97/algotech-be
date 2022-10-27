const app = require('../../../index');
const supertest = require('supertest');

test('Create brand', async () => {
  const data = {
    name: 'The Kettle Gourmet'
  };
  await supertest(app)
    .post('/brand')
    .set('origin', 'jest')
    .send(data)
    .expect(200)
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'Brand created' });
    });
});

test('Duplicate brand should not be created', async () => {
  const data = {
    name: 'The Kettle Gourmet'
  };
  await supertest(app)
    .post('/brand')
    .set('origin', 'jest')
    .send(data)
    .expect(400)
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'Brand already exists' });
    });
});
