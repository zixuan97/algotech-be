const app = require('../../../index');
const supertest = require('supertest');

test('Create user', async () => {
  const data = {
    firstName: 'Test',
    lastName: 'One',
    email: 'test1@gmail.com',
    role: 'ADMIN'
  };
  await supertest(app)
    .post('/user')
    .set('origin', 'jest')
    .send(data)
    .expect(200)
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'User created' });
    });
});

test('Duplicate user should not be created', async () => {
  const data = {
    firstName: 'Test',
    lastName: 'One',
    email: 'test1@gmail.com',
    role: 'ADMIN'
  };
  await supertest(app)
    .post('/user')
    .set('origin', 'jest')
    .send(data)
    .expect(400)
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'User already exists' });
    });
});
