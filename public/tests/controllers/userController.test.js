const app = require('../../../index');
const supertest = require('supertest');
const userModel = require('../../models/userModel');
const leaveModel = require('../../models/leaveModel');
const emailHelper = require('../../helpers/email');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'), // import and retain the original functionalities
  verify: jest.fn().mockReturnValue({ foo: 'bar' }) // overwrite verify
}));

jest.mock('../../models/userModel', () => {
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
    verifyPassword: jest.fn().mockImplementation(async () => {}),
    getEmployeesForOrgChart: jest.fn().mockImplementation(async () => {}),
    getEmployees: jest.fn().mockImplementation(async () => {}),
    createJobRole: jest.fn().mockImplementation(async () => {}),
    editJobRole: jest.fn().mockImplementation(async () => {}),
    getJobRole: jest.fn().mockImplementation(async () => {}),
    getJobRoleByName: jest.fn().mockImplementation(async () => {}),
    getAllJobRoles: jest.fn().mockImplementation(async () => {}),
    addJobRolesToUser: jest.fn().mockImplementation(async () => {}),
    deleteJobRole: jest.fn().mockImplementation(async () => {}),
    assignSubordinatesToManager: jest.fn().mockImplementation(async () => {}),
    unassignSubordinatesToManager: jest.fn().mockImplementation(async () => {}),
    setCEOMangerIdToOwnId: jest.fn().mockImplementation(async () => {}),
    getCEO: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../models/leaveModel', () => {
  return {
    createLeaveRecordByEmployeeId: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../helpers/email', () => {
  return {
    sendEmail: jest.fn().mockImplementation(async () => {})
  };
});

let jobRole = {
  jobRole: 'SWE',
  description: 'testing',
  usersInJobRole: [
    {
      id: 2,
      firstName: 'Wee Kek',
      lastName: 'Tan',
      email: 'tanwk@comp.nus.edu.sg',
      password: '',
      role: 'ADMIN',
      status: 'ACTIVE',
      isVerified: true,
      company: null,
      contactNo: null,
      tier: 'Tier 2',
      managerId: null,
      jobRoles: []
    },
    {
      id: 1,
      firstName: 'Wee Kek',
      lastName: 'Tan',
      email: 'tanwk@comp.nus.edu.sg',
      password: '',
      role: 'ADMIN',
      status: 'ACTIVE',
      isVerified: true,
      company: null,
      contactNo: null,
      tier: 'Tier 2',
      managerId: null,
      jobRoles: []
    }
  ]
};

let user = {
  id: 1,
  firstName: 'Meryl',
  lastName: 'Seow',
  email: 'merylseoww+3@gmail.com',
  role: 'INTERN',
  tier: 'Tier 5',
  password: 'password'
};

test('Create user', async () => {
  userModel.createUser.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .post('/user')
    .set('origin', 'jest')
    .send(user)
    .expect(200);

  //tier undefined
  const userNoTier = {
    firstName: 'Meryl',
    lastName: 'Seow',
    email: 'merylseoww+3@gmail.com',
    role: 'INTERN',
    password: 'password'
  };
  await supertest(app)
    .post('/user')
    .set('origin', 'jest')
    .send(userNoTier)
    .expect(200);
});

test('Create user, user already exist', async () => {
  userModel.createUser.mockImplementation(async () => {
    return {};
  });

  userModel.findUserByEmail.mockImplementation(async () => {
    return user;
  });
  await supertest(app)
    .post('/user')
    .set('origin', 'jest')
    .send(user)
    .expect(400);
});

test('Create user, send email error', async () => {
  userModel.createUser.mockImplementation(async () => {
    return {};
  });

  userModel.findUserByEmail.mockImplementation(async () => {});
  emailHelper.sendEmail.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/user')
    .set('origin', 'jest')
    .send(user)
    .expect(400);
});

test('Create user, model error', async () => {
  userModel.createUser.mockImplementation(async () => {
    throw new Error();
  });

  userModel.findUserByEmail.mockImplementation(async () => {});
  leaveModel.createLeaveRecordByEmployeeId.mockImplementation(async () => {
    return {};
  });
  emailHelper.sendEmail.mockImplementation(async () => {});
  await supertest(app)
    .post('/user')
    .set('origin', 'jest')
    .send(user)
    .expect(400);
});

test('Create user, model error', async () => {
  userModel.createUser.mockImplementation(async () => {});

  userModel.findUserByEmail.mockImplementation(async () => {});
  leaveModel.createLeaveRecordByEmployeeId.mockImplementation(async () => {
    throw new Error();
  });
  emailHelper.sendEmail.mockImplementation(async () => {});
  await supertest(app)
    .post('/user')
    .set('origin', 'jest')
    .send(user)
    .expect(400);
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
    .expect(200);
});

test('Create B2B user, user email exists', async () => {
  const b2bUser = {
    firstName: 'B2B',
    lastName: 'User',
    email: 'b2btest@gmail.com',
    status: 'PENDING',
    company: 'ALGOTECH',
    contactNo: '+6591111111'
  };

  userModel.findUserByEmail.mockImplementation(async () => {
    return b2bUser;
  });

  await supertest(app)
    .post('/user/b2b')
    .set('origin', 'jest')
    .send(b2bUser)
    .expect(400);
});

test('Create B2B user, model error', async () => {
  const b2bUser = {
    firstName: 'B2B',
    lastName: 'User',
    email: 'b2btest@gmail.com',
    status: 'PENDING',
    company: 'ALGOTECH',
    contactNo: '+6591111111'
  };

  userModel.findUserByEmail.mockImplementation(async () => {});
  userModel.createUser.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .post('/user/b2b')
    .set('origin', 'jest')
    .send(b2bUser)
    .expect(400);
});

test('Get one user', async () => {
  const verify = jest.spyOn(jwt, 'verify');
  verify.mockImplementation(() => () => user);

  await supertest(app)
    .get('/user')
    .set('origin', 'jest')
    .set('x-access-token', 'test')
    .expect(200);
});

test('Get one user,find user error', async () => {
  const verify = jest.spyOn(jwt, 'verify');
  verify.mockImplementation(() => () => user);

  userModel.findUserById.mockImplementation(() => {
    throw new Error();
  });

  await supertest(app)
    .get('/user')
    .set('origin', 'jest')
    .set('x-access-token', 'test')
    .expect(400);
});

test('Get user details', async () => {
  await supertest(app).get('/user/details/2').set('origin', 'jest').expect(200);
});

test('Get user details, get user details error', async () => {
  userModel.getUserDetails.mockImplementation(() => {
    throw new Error();
  });
  await supertest(app).get('/user/details/2').set('origin', 'jest').expect(400);
});

test('Auth user', async () => {
  const body = {
    email: 'merylseoww+3@gmail.com',
    password: 'password'
  };

  userModel.findUserByEmail.mockImplementation(async () => {
    return user;
  });
  await supertest(app)
    .post('/user/auth')
    .send(body)
    .set('origin', 'jest')
    .expect(400);
});

test('Auth user, user disabled/rejected/pending', async () => {
  const body = {
    email: 'merylseoww+3@gmail.com',
    password: 'password'
  };
  const encryptedPassword = await bcrypt.hash('password', 10);
  user.status = 'DISABLED';
  userModel.findUserByEmail.mockImplementation(async () => {
    return user;
  });
  await supertest(app)
    .post('/user/auth')
    .send(body)
    .set('origin', 'jest')
    .expect(400);

  user.status = 'REJECTED';
  userModel.findUserByEmail.mockImplementation(async () => {
    return user;
  });
  await supertest(app)
    .post('/user/auth')
    .send(body)
    .set('origin', 'jest')
    .expect(400);

  user.status = 'PENDING';
  userModel.findUserByEmail.mockImplementation(async () => {
    return user;
  });
  await supertest(app)
    .post('/user/auth')
    .send(body)
    .set('origin', 'jest')
    .expect(400);

  user.status = 'ACTIVE';
  user.password = encryptedPassword;
  userModel.findUserByEmail.mockImplementation(async () => {
    return user;
  });

  await supertest(app)
    .post('/user/auth')
    .send(body)
    .set('origin', 'jest')
    .expect(200);
});

test('Get all users', async () => {
  userModel.getUsers.mockImplementation(() => {
    return [user];
  });
  const verify = jest.spyOn(jwt, 'verify');
  verify.mockImplementation(() => () => user);

  await supertest(app)
    .get('/user/all')
    .set('origin', 'jest')
    .set('x-access-token', 'test')
    .expect(200);
});

test('Get all users, model error', async () => {
  userModel.getUsers.mockImplementation(() => {
    throw new Error();
  });
  const verify = jest.spyOn(jwt, 'verify');
  verify.mockImplementation(() => () => user);

  await supertest(app)
    .get('/user/all')
    .set('origin', 'jest')
    .set('x-access-token', 'test')
    .expect(400);
});

test('Delete user', async () => {
  await supertest(app).delete('/user/1').set('origin', 'jest').expect(200);
});

test('Delete user, model error', async () => {
  userModel.deleteUserById.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).delete('/user/1').set('origin', 'jest').expect(400);
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
    .expect(200);

  //user email alr exists
  userModel.findUserByEmail.mockImplementation(async () => {
    return {};
  });
  await supertest(app)
    .put('/user')
    .set('origin', 'jest')
    .send(editedUser)
    .expect(400);
});

test('Edit user, model error', async () => {
  userModel.findUserByEmail.mockImplementation(async () => {});

  userModel.editUser.mockImplementation(async () => {
    throw new Error();
  });
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
    .expect(400);
});

test('Enable user', async () => {
  await supertest(app).put('/user/enable/1').set('origin', 'jest').expect(200);
});

test('Enable user,model error', async () => {
  userModel.enableUser.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).put('/user/enable/1').set('origin', 'jest').expect(400);
});

test('Disable user', async () => {
  await supertest(app).put('/user/disable/1').set('origin', 'jest').expect(200);
});

test('Disable user, model error', async () => {
  userModel.disableUser.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).put('/user/disable/1').set('origin', 'jest').expect(400);
});

test('Change user role', async () => {
  await supertest(app)
    .put('/user/role/1/intern')
    .set('origin', 'jest')
    .expect(200);
});

test('Change user role, model error', async () => {
  userModel.changeUserRole.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .put('/user/role/1/intern')
    .set('origin', 'jest')
    .expect(400);
});

test('Send forget email password', async () => {
  const body = {
    recipientEmail: ''
  };

  userModel.findUserByEmail.mockImplementation(async () => {
    return user;
  });
  await supertest(app)
    .post('/user/forgetpw')
    .send(body)
    .set('origin', 'jest')
    .expect(200);
});

test('Send forget email password, nul; user', async () => {
  const body = {
    recipientEmail: ''
  };

  userModel.findUserByEmail.mockImplementation(async () => {});
  await supertest(app)
    .post('/user/forgetpw')
    .send(body)
    .set('origin', 'jest')
    .expect(400);
});

test('Send forget email password error', async () => {
  const body = {
    recipientEmail: ''
  };

  userModel.findUserByEmail.mockImplementation(async () => {
    return user;
  });

  emailHelper.sendEmail.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/user/forgetpw')
    .send(body)
    .set('origin', 'jest')
    .expect(400);
});

test('Update password (same password)', async () => {
  const body = {
    userEmail: '',
    currentPassword: 'password1',
    newPassword: 'password1'
  };

  await supertest(app)
    .post('/user/updatepw')
    .send(body)
    .set('origin', 'jest')
    .expect(400);
});

test('Update password (diff password)', async () => {
  const body = {
    userEmail: '',
    currentPassword: 'password1',
    newPassword: 'password'
  };

  userModel.verifyPassword.mockImplementation(async () => {
    return false;
  });
  await supertest(app)
    .post('/user/updatepw')
    .send(body)
    .set('origin', 'jest')
    .expect(400);
});

test('Update password ', async () => {
  const body = {
    userEmail: '',
    currentPassword: 'password',
    newPassword: 'password2'
  };
  userModel.findUserByEmail.mockImplementation(async () => {
    return user;
  });

  userModel.verifyPassword.mockImplementation(async () => {
    return true;
  });
  await supertest(app)
    .post('/user/updatepw')
    .send(body)
    .set('origin', 'jest')
    .expect(200);
});

test('Update password ,verify password error', async () => {
  const body = {
    userEmail: '',
    currentPassword: 'password',
    newPassword: 'password2'
  };
  userModel.findUserByEmail.mockImplementation(async () => {
    return user;
  });

  userModel.verifyPassword.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/user/updatepw')
    .send(body)
    .set('origin', 'jest')
    .expect(400);
});

test('Update password (user does not exist)', async () => {
  const body = {
    userEmail: '',
    currentPassword: 'password',
    newPassword: 'password2'
  };
  userModel.findUserByEmail.mockImplementation(async () => {});

  userModel.verifyPassword.mockImplementation(async () => {
    return true;
  });
  await supertest(app)
    .post('/user/updatepw')
    .send(body)
    .set('origin', 'jest')
    .expect(400);
});

test('Approve b2b user', async () => {
  userModel.generatePassword.mockImplementation(async () => {
    return user;
  });
  userModel.updateB2BUserStatus.mockImplementation(async () => {
    return user;
  });
  userModel.editUser.mockImplementation(async () => {});
  userModel.changePassword.mockImplementation(async () => {});
  emailHelper.sendEmail.mockImplementation(async () => {});
  await supertest(app).put('/user/approve/1').set('origin', 'jest').expect(200);

  // send email error
  emailHelper.sendEmail.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).put('/user/approve/1').set('origin', 'jest').expect(200);
});

test('Approve b2b user, model error', async () => {
  userModel.generatePassword.mockImplementation(async () => {
    return user;
  });
  userModel.updateB2BUserStatus.mockImplementation(async () => {
    throw new Error();
  });
  userModel.editUser.mockImplementation(async () => {});
  userModel.changePassword.mockImplementation(async () => {});
  await supertest(app).put('/user/approve/1').set('origin', 'jest').expect(400);
});

test('Reject b2b user', async () => {
  userModel.generatePassword.mockImplementation(async () => {
    return user;
  });
  userModel.updateB2BUserStatus.mockImplementation(async () => {
    return user;
  });
  userModel.editUser.mockImplementation(async () => {});
  userModel.changePassword.mockImplementation(async () => {});
  emailHelper.sendEmail.mockImplementation(async () => {});
  await supertest(app).put('/user/reject/1').set('origin', 'jest').expect(400);

  //send email error
  emailHelper.sendEmail.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).put('/user/reject/1').set('origin', 'jest').expect(400);
});

test('Get all B2B users', async () => {
  await supertest(app).get('/user/b2b/all').set('origin', 'jest').expect(200);
});

test('Get all B2B users,model error', async () => {
  userModel.getB2BUsers.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).get('/user/b2b/all').set('origin', 'jest').expect(400);
});

test('Get all pending B2B users', async () => {
  userModel.getB2BUsers.mockImplementation(async () => {
    return [user];
  });
  await supertest(app)
    .get('/user/b2b/pending')
    .set('origin', 'jest')
    .expect(200);
});
test('Get all pending B2B users, model error', async () => {
  userModel.getB2BUsers.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .get('/user/b2b/pending')
    .set('origin', 'jest')
    .expect(400);
});
test('Get all non B2B users', async () => {
  const verify = jest.spyOn(jwt, 'verify');
  verify.mockImplementation(() => () => user);

  userModel.getUsers.mockImplementation(() => {
    return [
      {
        id: 1,
        firstName: 'Meryl',
        lastName: 'Seow',
        email: 'merylseoww+3@gmail.com',
        role: 'INTERN',
        tier: 'Tier 5',
        password: 'password'
      }
    ];
  });
  await supertest(app)
    .get('/user/nonb2b/all')
    .set('origin', 'jest')
    .set('x-access-token', 'test')
    .expect(200);
});

test('Get all non B2B users', async () => {
  const verify = jest.spyOn(jwt, 'verify');
  verify.mockImplementation(() => () => user);

  userModel.getUsers.mockImplementation(() => {
    throw new Error();
  });
  await supertest(app)
    .get('/user/nonb2b/all')
    .set('origin', 'jest')
    .set('x-access-token', 'test')
    .expect(400);
});

test('Get number of pending users', async () => {
  userModel.getB2BUsers.mockImplementation(async () => {
    return [
      {
        id: 1,
        firstName: 'Meryl',
        lastName: 'Seow',
        email: 'merylseoww+3@gmail.com',
        role: 'INTERN',
        tier: 'Tier 5',
        password: 'password'
      }
    ];
  });
  await supertest(app)
    .get('/user/pending/count')
    .set('origin', 'jest')
    .expect(200);
});

test('Get all employees', async () => {
  userModel.getEmployees.mockImplementation(async () => {
    return [
      {
        id: 1,
        firstName: 'Meryl',
        lastName: 'Seow',
        email: 'merylseoww+3@gmail.com',
        role: 'INTERN',
        tier: 'Tier 5',
        password: 'password'
      }
    ];
  });
  await supertest(app)
    .get('/user/employee/all')
    .set('x-access-token', 'test')
    .set('origin', 'jest')
    .expect(400);

  //with subordinates
  userModel.getEmployees.mockImplementation(async () => {
    return [
      {
        id: 1,
        firstName: 'Meryl',
        lastName: 'Seow',
        email: 'merylseoww+3@gmail.com',
        role: 'INTERN',
        tier: 'Tier 5',
        password: 'password',
        manager: 'test',
        subordinates: [{ id: 1 }]
      }
    ];
  });
  await supertest(app)
    .get('/user/employee/all')
    .set('x-access-token', 'test')
    .set('origin', 'jest')
    .expect(200);
});

test('Get job role by name', async () => {
  userModel.getJobRoleByName.mockImplementation(async () => {
    return {
      id: 3,
      jobRole: 'engineer',
      usersInJobRole: [
        {
          id: 4,
          firstName: 'Wee Kek',
          lastName: 'Tan',
          email: 'tanwk+user@comp.nus.edu.sg',
          password: '',
          role: 'FULLTIME',
          status: 'ACTIVE',
          isVerified: true,
          company: null,
          contactNo: null,
          tier: 'Tier 2',
          managerId: 3
        },
        {
          id: 1,
          firstName: 'Destinee',
          lastName: 'Ow',
          email: 'destineeow32@gmail.com',
          password: '',
          role: 'ADMIN',
          status: 'ACTIVE',
          isVerified: true,
          company: null,
          contactNo: null,
          tier: 'Manager',
          managerId: 1
        }
      ]
    };
  });
  await supertest(app)
    .get('/user/jobrole/name/engineer')
    .set('origin', 'jest')
    .expect(200);
});

test('Get job role by name, error', async () => {
  userModel.getJobRoleByName.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .get('/user/jobrole/name/engineer')
    .set('origin', 'jest')
    .expect(400);
});

test('Create Job role', async () => {
  userModel.getJobRoleByName.mockImplementation(async () => {});
  userModel.createJobRole.mockImplementation(async () => {
    return jobRole;
  });
  await supertest(app)
    .post('/user/jobrole')
    .set('origin', 'jest')
    .send(jobRole)
    .expect(200);
});

test('Create Job role, error', async () => {
  userModel.getJobRoleByName.mockImplementation(async () => {});
  userModel.createJobRole.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/user/jobrole')
    .set('origin', 'jest')
    .send(jobRole)
    .expect(400);
});

test('Create Job role, role exists', async () => {
  userModel.getJobRoleByName.mockImplementation(async () => {
    return [
      {
        id: 3,
        jobRole: 'engineer',
        usersInJobRole: [
          {
            id: 4,
            firstName: 'Wee Kek',
            lastName: 'Tan',
            email: 'tanwk+user@comp.nus.edu.sg',
            password: '',
            role: 'FULLTIME',
            status: 'ACTIVE',
            isVerified: true,
            company: null,
            contactNo: null,
            tier: 'Tier 2',
            managerId: 3
          },
          {
            id: 1,
            firstName: 'Destinee',
            lastName: 'Ow',
            email: 'destineeow32@gmail.com',
            password: '',
            role: 'ADMIN',
            status: 'ACTIVE',
            isVerified: true,
            company: null,
            contactNo: null,
            tier: 'Manager',
            managerId: 1
          }
        ]
      }
    ];
  });
  await supertest(app)
    .post('/user/jobrole')
    .set('origin', 'jest')
    .send(jobRole)
    .expect(400);
});

test('Edit Job role', async () => {
  userModel.getJobRoleByName.mockImplementation(async () => {});
  userModel.editJobRole.mockImplementation(async () => {
    return jobRole;
  });
  await supertest(app)
    .put('/user/jobrole')
    .set('origin', 'jest')
    .send(jobRole)
    .expect(200);
});

test('Edit Job role, error', async () => {
  userModel.getJobRoleByName.mockImplementation(async () => {});
  userModel.editJobRole.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .put('/user/jobrole')
    .set('origin', 'jest')
    .send(jobRole)
    .expect(400);
});

test('Edit Job role, role exists', async () => {
  userModel.getJobRoleByName.mockImplementation(async () => {
    jobRole.id = 2;
    return jobRole;
  });
  userModel.editJobRole.mockImplementation(async () => {
    return jobRole;
  });
  jobRole.id = 1;
  await supertest(app)
    .put('/user/jobrole')
    .set('origin', 'jest')
    .send(jobRole)
    .expect(400);
});

test('Add job roles to user', async () => {
  userModel.addJobRolesToUser.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Meryl',
      lastName: 'Seow',
      email: 'merylseoww+3@gmail.com',
      role: 'INTERN',
      tier: 'Tier 5',
      password: 'password',
      manager: 'test',
      subordinates: [{ id: 1 }]
    };
  });
  await supertest(app)
    .post('/user/jobroles')
    .set('origin', 'jest')
    .send(jobRole)
    .expect(200);
});

test('Add job roles to user,error', async () => {
  userModel.addJobRolesToUser.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/user/jobroles')
    .set('origin', 'jest')
    .send(jobRole)
    .expect(400);
});

test('Delete job role', async () => {
  userModel.deleteJobRole.mockImplementation(async () => {});
  await supertest(app)
    .delete('/user/jobrole/1')
    .set('origin', 'jest')
    .expect(200);
});

test('Delete job role,error', async () => {
  userModel.deleteJobRole.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .delete('/user/jobrole/1')
    .set('origin', 'jest')
    .expect(400);
});

test('Get job role by id', async () => {
  userModel.getJobRole.mockImplementation(async () => {
    return jobRole;
  });
  await supertest(app).get('/user/jobrole/1').set('origin', 'jest').expect(200);
});

test('Get job role by id,error', async () => {
  userModel.getJobRole.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app).get('/user/jobrole/1').set('origin', 'jest').expect(400);
});

test('Get all job roles', async () => {
  userModel.getAllJobRoles.mockImplementation(async () => {
    return [jobRole];
  });
  await supertest(app)
    .get('/user/jobroles/all')
    .set('origin', 'jest')
    .expect(200);
});

test('Get all job roles,error', async () => {
  userModel.getAllJobRoles.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .get('/user/jobroles/all')
    .set('origin', 'jest')
    .send(jobRole)
    .expect(400);
});

test('Assign subordinates to manager', async () => {
  userModel.assignSubordinatesToManager.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Meryl',
      lastName: 'Seow',
      email: 'merylseoww+3@gmail.com',
      role: 'INTERN',
      tier: 'Tier 5',
      password: 'password',
      manager: 'test',
      subordinates: [{ id: 1 }]
    };
  });

  const body = { id: 1, users: [user] };
  await supertest(app)
    .post('/user/assign/subordinates')
    .set('origin', 'jest')
    .send(body)
    .expect(200);

  //manager == null
  userModel.assignSubordinatesToManager.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Meryl',
      lastName: 'Seow',
      email: 'merylseoww+3@gmail.com',
      role: 'INTERN',
      tier: 'Tier 5',
      password: 'password',
      subordinates: [{ id: 1 }],
      manager: null
    };
  });

  await supertest(app)
    .post('/user/assign/subordinates')
    .set('origin', 'jest')
    .send(body)
    .expect(200);
});

test('Assign subordinates to manager,error', async () => {
  userModel.assignSubordinatesToManager.mockImplementation(async () => {
    throw new Error();
  });
  const body = { id: 1, users: [user] };
  await supertest(app)
    .post('/user/assign/subordinates')
    .set('origin', 'jest')
    .send(body)
    .expect(400);
});

test('Unassign subordinates to manager', async () => {
  userModel.unassignSubordinatesToManager.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Meryl',
      lastName: 'Seow',
      email: 'merylseoww+3@gmail.com',
      role: 'INTERN',
      tier: 'Tier 5',
      password: 'password',
      manager: 'test',
      subordinates: [{ id: 1 }]
    };
  });

  const body = { id: 1, users: [user] };
  await supertest(app)
    .post('/user/unassign/subordinates')
    .set('origin', 'jest')
    .send(body)
    .expect(200);

  //manager == null
  userModel.unassignSubordinatesToManager.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Meryl',
      lastName: 'Seow',
      email: 'merylseoww+3@gmail.com',
      role: 'INTERN',
      tier: 'Tier 5',
      password: 'password',
      subordinates: [{ id: 1 }],
      manager: null
    };
  });

  await supertest(app)
    .post('/user/unassign/subordinates')
    .set('origin', 'jest')
    .send(body)
    .expect(200);
});

test('Unassign subordinates to manager,error', async () => {
  userModel.unassignSubordinatesToManager.mockImplementation(async () => {
    throw new Error();
  });
  const body = { id: 1, users: [user] };
  await supertest(app)
    .post('/user/unassign/subordinates')
    .set('origin', 'jest')
    .send(body)
    .expect(400);
});

test('Update employee', async () => {
  userModel.findUserById.mockImplementation(async () => {
    return user;
  });
  userModel.addJobRolesToUser.mockImplementation(async () => {
    return user;
  });

  userModel.assignSubordinatesToManager.mockImplementation(async () => {
    return user;
  });
  const body = { id: 1, jobRoles: [jobRole], managerId: 1 };
  await supertest(app)
    .put('/user/employee')
    .set('origin', 'jest')
    .send(body)
    .expect(200);

  //employeeToUpdate === null
  userModel.findUserById.mockImplementation(async () => {});
  await supertest(app)
    .put('/user/employee')
    .set('origin', 'jest')
    .send(body)
    .expect(200);

  // null user
  userModel.addJobRolesToUser.mockImplementation(async () => {});
  await supertest(app)
    .put('/user/employee')
    .set('origin', 'jest')
    .send(body)
    .expect(200);
});

test('Update employee,error', async () => {
  userModel.findUserById.mockImplementation(async () => {
    return user;
  });
  userModel.addJobRolesToUser.mockImplementation(async () => {
    throw new Error();
  });

  userModel.assignSubordinatesToManager.mockImplementation(async () => {
    return user;
  });
  const body = { id: 1, jobRoles: [jobRole], managerId: 1 };
  await supertest(app)
    .put('/user/employee')
    .set('origin', 'jest')
    .send(body)
    .expect(400);
});

test('Update employee, has manager id', async () => {
  userModel.findUserById.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Meryl',
      lastName: 'Seow',
      email: 'merylseoww+3@gmail.com',
      role: 'INTERN',
      tier: 'Tier 5',
      password: 'password',
      subordinates: [{ id: 1 }],
      managerId: 1
    };
  });
  userModel.unassignSubordinatesToManager.mockImplementation(async () => {});
  userModel.addJobRolesToUser.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Meryl',
      lastName: 'Seow',
      email: 'merylseoww+3@gmail.com',
      role: 'INTERN',
      tier: 'Tier 5',
      password: 'password',
      subordinates: [{ id: 1 }],
      managerId: 1
    };
  });
  let body = { id: 1, jobRoles: [jobRole] };
  await supertest(app)
    .put('/user/employee')
    .set('origin', 'jest')
    .send(body)
    .expect(200);

  //employee.managerId is null
  userModel.findUserById.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Meryl',
      lastName: 'Seow',
      email: 'merylseoww+3@gmail.com',
      role: 'INTERN',
      tier: 'Tier 5',
      password: 'password',
      subordinates: [{ id: 1 }]
    };
  });
  await supertest(app)
    .put('/user/employee')
    .set('origin', 'jest')
    .send(body)
    .expect(200);
});

test('Set ceo', async () => {
  userModel.getCEO.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Meryl',
      lastName: 'Seow',
      email: 'merylseoww+3@gmail.com',
      role: 'CEO',
      tier: 'Tier 5',
      password: 'password',
      manager: 'test',
      subordinates: [{ id: 1 }]
    };
  });

  userModel.getEmployees.mockImplementation(async () => {
    return [user];
  });

  userModel.setCEOMangerIdToOwnId.mockImplementation(async () => {});
  userModel.assignSubordinatesToManager.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Testing',
      lastName: 'nani',
      email: 'merylseoww+3@gmail.com',
      role: 'CEO',
      tier: 'Tier 5',
      password: 'password',
      manager: 'test',
      subordinates: [{ id: 1 }, { id: 2 }]
    };
  });

  await supertest(app).post('/user/ceo/1').set('origin', 'jest').expect(200);
});

test('Set ceo, error', async () => {
  userModel.getCEO.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Meryl',
      lastName: 'Seow',
      email: 'merylseoww+3@gmail.com',
      role: 'CEO',
      tier: 'Tier 5',
      password: 'password',
      manager: 'test',
      subordinates: [{ id: 1 }]
    };
  });

  userModel.getEmployees.mockImplementation(async () => {
    return [user];
  });

  userModel.setCEOMangerIdToOwnId.mockImplementation(async () => {});
  userModel.assignSubordinatesToManager.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app).post('/user/ceo/1').set('origin', 'jest').expect(400);
});

test('get ceo', async () => {
  userModel.getCEO.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Meryl',
      lastName: 'Seow',
      email: 'merylseoww+3@gmail.com',
      role: 'CEO',
      tier: 'Tier 5',
      password: 'password',
      manager: 'test',
      subordinates: [{ id: 1 }]
    };
  });

  await supertest(app).get('/user/ceo').set('origin', 'jest').expect(200);
});

test('get ceo,error', async () => {
  userModel.getCEO.mockImplementation(async () => {
    return null;
  });

  await supertest(app).get('/user/ceo').set('origin', 'jest').expect(400);
});

test('change ceo', async () => {
  userModel.getCEO.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Meryl',
      lastName: 'Seow',
      email: 'merylseoww+3@gmail.com',
      role: 'CEO',
      tier: 'Tier 5',
      password: 'password',
      manager: 'test',
      subordinates: [{ id: 1 }]
    };
  });

  userModel.getEmployees.mockImplementation(async () => {
    return [user];
  });

  userModel.setCEOMangerIdToOwnId.mockImplementation(async () => {});
  userModel.assignSubordinatesToManager.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Meryl',
      lastName: 'Seow',
      email: 'merylseoww+3@gmail.com',
      role: 'CEO',
      tier: 'Tier 5',
      password: 'password',
      manager: 'test',
      subordinates: [{ id: 1 }]
    };
  });

  await supertest(app)
    .post('/user/changeceo/1')
    .set('origin', 'jest')
    .expect(200);
  //prev ceo null
  userModel.getCEO.mockImplementation(async () => {
    return null;
  });
  await supertest(app)
    .post('/user/changeceo/1')
    .set('origin', 'jest')
    .expect(200);
});

test('change ceo,error', async () => {
  userModel.getCEO.mockImplementation(async () => {
    return {
      id: 1,
      firstName: 'Meryl',
      lastName: 'Seow',
      email: 'merylseoww+3@gmail.com',
      role: 'CEO',
      tier: 'Tier 5',
      password: 'password',
      manager: 'test',
      subordinates: [{ id: 1 }]
    };
  });

  userModel.getEmployees.mockImplementation(async () => {
    return [user];
  });

  userModel.setCEOMangerIdToOwnId.mockImplementation(async () => {});
  userModel.assignSubordinatesToManager.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .post('/user/changeceo/1')
    .set('origin', 'jest')
    .expect(400);
});
