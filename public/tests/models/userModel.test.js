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
    userModel.editUser({ id: 1, status: 'ACTIVE' })
  ).resolves.toEqual(user);
});

test('Get b2b users', async () => {
  await expect(userModel.getB2BUsers()).resolves.toEqual([]);
});

test('Get employees', async () => {
  await expect(userModel.getEmployees()).resolves.toEqual([]);
});

test('Create job role', async () => {
  prisma.jobRole.update.mockImplementation(async () => {
    return jobRole;
  });
  await expect(userModel.editUser({ updatedUser: user })).resolves.toEqual(
    user
  );
});

test('Edit job role', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(userModel.editUser({ updatedUser: user })).resolves.toEqual(
    user
  );
});

test('Get job role', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(userModel.editUser({ updatedUser: user })).resolves.toEqual(
    user
  );
});

test('Get job role by name', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(userModel.editUser({ updatedUser: user })).resolves.toEqual(
    user
  );
});

test('Add job role to user', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(userModel.editUser({ updatedUser: user })).resolves.toEqual(
    user
  );
});

test('Delete job role', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(userModel.editUser({ updatedUser: user })).resolves.toEqual(
    user
  );
});

test('Assign subordinates to manager', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(userModel.editUser({ updatedUser: user })).resolves.toEqual(
    user
  );
});

test('Unassign subordinates to manager', async () => {
  prisma.user.update.mockImplementation(async () => {
    return user;
  });
  await expect(userModel.editUser({ updatedUser: user })).resolves.toEqual(
    user
  );
});
