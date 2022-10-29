const app = require('../../index');
const supertest = require('supertest');

const user = {
  firstName: 'Test',
  lastName: 'One',
  email: 'test1@gmail.com',
  role: 'ADMIN',
  isVerified: true
};

// mock logger to remove test logs
jest.mock('../helpers/logger', () => {
  return {
    log: {
      out: jest.fn(),
      debug: jest.fn(),
      error: jest.fn()
    }
  };
});

jest.mock('../models/userModel', () => {
  return {
    createUser: jest.fn().mockImplementation(async () => {}),
    getUsers: jest.fn().mockImplementation(async () => {}),
    findUserByEmail: jest.fn().mockImplementation(async () => {}),
    generatePassword: jest.fn().mockImplementation(async () => {}),
    getUsers: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../helpers/email', () => {
  return {
    sendEmail: jest.fn().mockImplementation(async () => {})
  };
});

test('Create user', async () => {
  await supertest(app)
    .post('/user')
    .set('origin', 'jest')
    .send(user)
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'User created' });
    });
});

test('Get all users', async () => {
  await supertest(app)
    .get('/user')
    .set('origin', 'jest')
    .send(user)
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test.skip('Duplicate user should not be created', async () => {
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
