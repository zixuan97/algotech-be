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

jest.mock('../models/userModel', () => {
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

test('Create B2B user', async () => {
  const b2bUser = {
    firstName: 'B2B',
    lastName: 'User',
    email: 'b2btest@gmail.com',
    status: 'PENDING',
    company: 'ALGOTECH',
    contactNo: '+6591111111'
  };
  await supertest(app)
    .post('/user/b2b')
    .set('origin', 'jest')
    .send(b2bUser)
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'B2B User created' });
    });
});

test('Get all users', async () => {
  await supertest(app)
    .get('/user/all')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test('Edit user', async () => {
  const editedUser = {
    id: 1,
    firstName: 'Test',
    lastName: 'Two',
    email: 'test2@gmail.com',
    role: 'ADMIN'
  };
  await supertest(app)
    .put('/user')
    .set('origin', 'jest')
    .send(editedUser)
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'User edited' });
    });
});

test('Delete user', async () => {
  await supertest(app)
    .delete('/user/1')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'User deleted' });
    });
});

test('Enable user', async () => {
  await supertest(app)
    .put('/user/enable/1')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'User enabled' });
    });
});

test('Disable user', async () => {
  await supertest(app)
    .put('/user/disable/1')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'User disabled' });
    });
});

test.skip('Get all B2B users', async () => {
  await supertest(app)
    .get('/user/b2b/all')
    .set('origin', 'jest')
    .then((response) => {
      console.log(response.body);
      expect(response.body).toStrictEqual({});
    });
});
