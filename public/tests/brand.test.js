const app = require('../../index');
const supertest = require('supertest');

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

jest.mock('../models/brandModel', () => {
  return {
    createUser: jest.fn().mockImplementation(async () => {}),
    getUsers: jest.fn().mockImplementation(async () => {}),
    editUser: jest.fn().mockImplementation(async () => {}),
    deleteUserById: jest.fn().mockImplementation(async () => {}),
    enableUser: jest.fn().mockImplementation(async () => {}),
    disableUser: jest.fn().mockImplementation(async () => {}),
    findUserByEmail: jest.fn().mockImplementation(async () => {}),
    generatePassword: jest.fn().mockImplementation(async () => {}),
    getB2BUsers: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../helpers/email', () => {
  return {
    sendEmail: jest.fn().mockImplementation(async () => {})
  };
});

test('Create user', async () => {
  const user = {
    firstName: 'Test',
    lastName: 'One',
    email: 'test1@gmail.com',
    role: 'ADMIN',
    isVerified: true
  };
  await supertest(app)
    .post('/user')
    .set('origin', 'jest')
    .send(user)
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'User created' });
    });
});
