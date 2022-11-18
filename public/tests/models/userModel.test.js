const userModel = require('../../models/userModel');
const { prisma } = require('../../models/index');
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
let user;
const jobRole = {
  jobRole: 'Project Managers'
};
beforeEach(async () => {
  //mock math.random()
  const encryptedPassword = await bcrypt.hash('password', 10);
  user = {
    firstName: 'Zi Kun',
    lastName: 'Teng',
    email: 'meleenoob971+b2b@gmail.com',
    password: encryptedPassword,
    role: 'B2B',
    isVerified: false,
    tier: 'Tier 3'
  };
  jest.spyOn(global.Math, 'random').mockReturnValue(0.1);
});

afterEach(() => {
  jest.spyOn(global.Math, 'random').mockRestore();
});

jest.mock('../../models/index', () => {
  return {
    prisma: {
      user: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {})
      },
      jobRole: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {})
      }
    }
  };
});

test('create user model', async () => {
  prisma.user.create.mockImplementation(async () => {
    return {
      user
    };
  });
  await expect(userModel.createUser(user)).resolves.toEqual({ user });

  const encryptedPassword = await bcrypt.hash('password', 10);
  const userAdmin = {
    firstName: 'Zi Kun',
    lastName: 'Teng',
    email: 'meleenoob971+b2b@gmail.com',
    password: encryptedPassword,
    isVerified: false,
    role: 'B2B',
    tier: 'Tier 3',
    status: 'PENDING'
  };

  await expect(userModel.createUser(userAdmin)).resolves.toEqual({ user });
});

test('create user model not b2b', async () => {
  const encryptedPassword = await bcrypt.hash('password', 10);
  const userAdmin = (user = {
    firstName: 'Zi Kun',
    lastName: 'Teng',
    email: 'meleenoob971+b2b@gmail.com',
    password: encryptedPassword,
    role: 'ADMIN',
    isVerified: false,
    tier: 'Tier 3'
  });
  prisma.user.create.mockImplementation(async () => {
    return {
      userAdmin
    };
  });
  await expect(userModel.createUser(userAdmin)).resolves.toEqual({ userAdmin });
});

test('get all users', async () => {
  await expect(userModel.getUsers()).resolves.toEqual([]);
});

test('find user by id', async () => {
  prisma.user.findUnique.mockImplementation(async () => {
    return user;
  });
  await expect(userModel.findUserById({ id: 1 })).resolves.toEqual(user);
});

test('find user by email', async () => {
  prisma.user.findUnique.mockImplementation(async () => {
    return user;
  });
  await expect(
    userModel.findUserByEmail({ email: 'meleenoob971+b2b@gmail.com' })
  ).resolves.toEqual(user);
});

test('get user details', async () => {
  prisma.user.findUnique.mockImplementation(async () => {
    return user;
  });
  await expect(userModel.getUserDetails({ id: 1 })).resolves.toEqual(user);
});

test('update user', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(userModel.editUser({ updatedUser: user })).resolves.toEqual(
    user
  );
});

test('delete user', async () => {
  prisma.user.delete.mockImplementation(async () => {
    return {};
  });
  await expect(userModel.deleteUserById({ id: 1 })).resolves.toEqual(1);
});

test('enable user', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(userModel.enableUser({ id: 1 })).resolves.toEqual(user);
});

test('disable user', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(userModel.disableUser({ id: 1 })).resolves.toEqual(user);
});

test('change user role', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(
    userModel.changeUserRole({ id: 1, action: 'intern' })
  ).resolves.toEqual(user);
  await expect(
    userModel.changeUserRole({ id: 1, action: 'pt' })
  ).resolves.toEqual(user);
  await expect(
    userModel.changeUserRole({ id: 1, action: 'ft' })
  ).resolves.toEqual(user);
  await expect(
    userModel.changeUserRole({ id: 1, action: 'customer' })
  ).resolves.toEqual(user);
  await expect(
    userModel.changeUserRole({ id: 1, action: 'admin' })
  ).resolves.toEqual(user);

  await expect(
    userModel.changeUserRole({ id: 1, action: 'nani' })
  ).resolves.toEqual(user);
});

test('generate user password', async () => {
  await expect(userModel.generatePassword()).resolves.toEqual('GGGGGGGG');
});

test('verify password', async () => {
  prisma.user.update.mockImplementation(() => {
    return user;
  });
  await expect(
    userModel.verifyPassword({
      userEmail: 'meleenoob971+b2b@gmail.com',
      currentPassword: 'password',
      newPassword: 'hello123'
    })
  ).resolves.toEqual(true);
});

test('verify password wrong password', async () => {
  prisma.user.update.mockImplementation(() => {
    return user;
  });
  await expect(
    userModel.verifyPassword({
      userEmail: 'meleenoob971+b2b@gmail.com',
      currentPassword: 'passwordwrong',
      newPassword: 'hello123'
    })
  ).resolves.toEqual(false);
});

test('change password', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(
    userModel.changePassword({ updatedUser: user })
  ).resolves.toEqual(user);
});

test('Update b2b user status', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(
    userModel.updateB2BUserStatus({ id: 1, status: 'ACTIVE' })
  ).resolves.toEqual(user);
});

test('Get b2b users', async () => {
  await expect(userModel.getB2BUsers()).resolves.toEqual([]);
});

test('Get employees', async () => {
  await expect(userModel.getEmployees()).resolves.toEqual([]);
});

test('Get employees for org chart', async () => {
  await expect(userModel.getEmployeesForOrgChart()).resolves.toEqual([]);
});

test('Create job role', async () => {
  prisma.jobRole.create.mockImplementation(async () => {
    return jobRole;
  });
  await expect(
    userModel.createJobRole({
      jobRole: 'Assistant Director',
      usersInJobRole: [{ id: 1 }],
      description: ''
    })
  ).resolves.toEqual(jobRole);
});

test('Edit job role', async () => {
  prisma.jobRole.update.mockImplementation(async () => {
    return jobRole;
  });
  await expect(
    userModel.editJobRole({
      jobRole: 'Director',
      id: 1,
      usersInJobRole: [{ id: 1 }],
      description: ''
    })
  ).resolves.toEqual(jobRole);
});

test('Get job role', async () => {
  prisma.jobRole.findUnique.mockImplementation(async () => {
    return jobRole;
  });
  await expect(userModel.getJobRole({ id: 1 })).resolves.toEqual(jobRole);
});

test('Get all job roles', async () => {
  prisma.jobRole.findMany.mockImplementation(async () => {
    return [];
  });
  await expect(userModel.getAllJobRoles()).resolves.toEqual([]);
});

test('Get job role by name', async () => {
  prisma.jobRole.findUnique.mockImplementation(async () => {
    return jobRole;
  });
  await expect(
    userModel.getJobRoleByName({ jobRole: 'Director' })
  ).resolves.toEqual(jobRole);
});

test('Add job role to user', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(
    userModel.addJobRolesToUser({ userId: 1, jobRoles: ['Director'] })
  ).resolves.toEqual(user);
});

test('Delete job role', async () => {
  prisma.jobRole.delete.mockImplementation(async () => {
    return jobRole;
  });
  await expect(userModel.deleteJobRole({ id: 1 })).resolves.toEqual(1);
});

test('Assign subordinates to manager', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(
    userModel.assignSubordinatesToManager({ id: 1, users: [{ user }] })
  ).resolves.toEqual(user);
});

test('Unassign subordinates to manager', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(
    userModel.unassignSubordinatesToManager({ id: 1, users: [{ user }] })
  ).resolves.toEqual(user);
});

test('Set CEO Manager to own id', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(userModel.setCEOMangerIdToOwnId({ id: 1 })).resolves.toEqual(
    user
  );
});

test('get ceo', async () => {
  prisma.user.findMany.mockImplementation(async () => {
    return [user];
  });
  await expect(userModel.getCEO()).resolves.toEqual(user);
});

test('get ceo, no ceo', async () => {
  prisma.user.findMany.mockImplementation(async () => {
    return [];
  });
  await expect(userModel.getCEO()).resolves.toEqual(null);
});
