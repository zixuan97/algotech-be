const app = require('../../index');
const supertest = require('supertest');
const userModel = require('../models/userModel');

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
    getB2BUsers: jest.fn().mockImplementation(async () => []),
    findUserById: jest.fn().mockImplementation(async () => {
      return {};
    }),
    getUserDetails: jest.fn().mockImplementation(async () => {
      return {};
    }),
    changeUserRole: jest.fn().mockImplementation(async () => {}),
    updateB2BUserStatus: jest.fn().mockImplementation(async () => {}),
    changePassword: jest.fn().mockImplementation(async () => {}),
    verifyPassword: jest.fn().mockImplementation(async () => {})
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

  userModel.createUser.mockImplementation(async () => {
    return {};
  });
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

test('Get one user', async () => {
  await supertest(app)
    .get('/user')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test('Get user details', async () => {
  await supertest(app)
    .get('/user/details/2')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test('Auth user', async () => {
  const body = {
    email: '',
    password: ''
  };
  await supertest(app)
    .post('/user/auth')
    .send(body)
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({});
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

test('Delete user', async () => {
  await supertest(app)
    .delete('/user/1')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'User deleted' });
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

test('Change user role', async () => {
  await supertest(app)
    .put('/user/role/1/intern')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'User role updated' });
    });
});

test('Send forget email password', async () => {
  const body = {
    recipientEmail: ''
  };
  await supertest(app)
    .post('/user/forgetpw')
    .send(body)
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test('Update password (same password)', async () => {
  const body = {
    userEmail: '',
    currentPassword: 'password',
    newPassword: 'password'
  };
  await supertest(app)
    .post('/user/updatepw')
    .send(body)
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({
        message: 'Old and new password cannot be the same'
      });
    });
});

test('Update password (user does not exist) ', async () => {
  const body = {
    userEmail: '',
    currentPassword: 'password',
    newPassword: 'password2'
  };

  await supertest(app)
    .post('/user/updatepw')
    .send(body)
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({
        message: 'User does not exist'
      });
    });
});

test('Approve b2b user', async () => {
  await supertest(app)
    .put('/user/approve/1')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test('Reject b2b user', async () => {
  await supertest(app)
    .put('/user/reject/1')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test('Get all B2B users', async () => {
  await supertest(app)
    .get('/user/b2b/all')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual([]);
    });
});

test('Get all pending B2B users', async () => {
  await supertest(app)
    .get('/user/b2b/pending')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual([]);
    });
});

test('Get all non B2B users', async () => {
  await supertest(app)
    .get('/user/nonb2b/all')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual({});
    });
});

test('Get number of users', async () => {
  await supertest(app)
    .get('/user/pending/count')
    .set('origin', 'jest')
    .then((response) => {
      expect(response.body).toStrictEqual(0);
    });
});
