const { prisma } = require('./index.js');
const bcrypt = require('bcrypt');
const { UserStatus, UserRole } = require('@prisma/client');

const createUser = async (req) => {
  let {
    firstName,
    lastName,
    email,
    password,
    role,
    status,
    isVerified,
    company,
    contactNo,
    tier,
    jobRoles
  } = req;
  let encryptedPassword = '';
  if (role !== UserRole.B2B) {
    encryptedPassword = await bcrypt.hash(password, 10);
  } else {
    if (status === undefined) {
      status = UserStatus.PENDING;
    }
  }
  const user = await prisma.User.create({
    data: {
      firstName,
      lastName,
      email,
      password: encryptedPassword,
      role,
      status,
      isVerified,
      company,
      contactNo,
      tier,
      jobRoles
    }
  });
  return user;
};

const getUsers = async () => {
  const users = await prisma.User.findMany({});
  return users;
};

const getB2BUsers = async () => {
  const users = await prisma.User.findMany({
    where: {
      role: UserRole.B2B
    }
  });
  return users;
};

const getEmployees = async () => {
  const users = await prisma.User.findMany({
    where: {
      NOT: {
        OR: [
          {
            role: UserRole.B2B
          },
          {
            role: UserRole.CUSTOMER
          }
        ]
      }
    },
    include: {
      jobRoles: true
    }
  });
  return users;
};

const findUserById = async (req) => {
  const { id } = req;
  const user = await prisma.User.findUnique({
    where: {
      id
    }
  });
  return user;
};

const findUserByEmail = async (req) => {
  const { email } = req;
  const user = await prisma.User.findUnique({
    where: {
      email: email
    }
  });
  return user;
};

const getUserDetails = async (req) => {
  const { id } = req;
  const user = await prisma.User.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      subjects: true
    }
  });
  return user;
};

const editUser = async (req) => {
  const { updatedUser } = req;
  const id = updatedUser.id;
  user = await prisma.User.update({
    where: { id: Number(id) },
    data: {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      isVerified: updatedUser.isVerified,
      company: updatedUser.company,
      contactNo: updatedUser.contactNo,
      tier: updatedUser.tier
    }
  });
  return user;
};

const deleteUserById = async (req) => {
  const { id } = req;
  let user = await prisma.user.update({
    where: { id: Number(id) },
    data: {
      leaveApplications: {
        deleteMany: {}
      },
      leaveRecord: {
        delete: true
      },
      createdSubjects: {
        deleteMany: {}
      },
      lastUpdatedSubjects: {
        deleteMany: {}
      },
      subjectsAssigned: {
        deleteMany: {}
      },
      vettedLeaves: {
        deleteMany: {}
      }
    }
  });
  user = await prisma.User.delete({
    where: {
      id: Number(id)
    }
  });
  return id;
};

const enableUser = async (req) => {
  const { id } = req;
  const user = await prisma.User.update({
    where: { id: Number(id) },
    data: {
      status: UserStatus.ACTIVE
    }
  });
  return user;
};

const disableUser = async (req) => {
  const { id } = req;
  const user = await prisma.User.update({
    where: { id: Number(id) },
    data: {
      status: UserStatus.DISABLED
    }
  });
  return user;
};

const changeUserRole = async (req) => {
  const { id, action } = req;
  if (action == 'intern') {
    newRole = UserRole.INTERN;
  } else if (action === 'pt') {
    newRole = UserRole.PARTTIME;
  } else if (action === 'ft') {
    newRole = UserRole.FULLTIME;
  } else if (action === 'customer') {
    newRole = UserRole.CUSTOMER;
  } else if (action === 'admin') {
    newRole = UserRole.ADMIN;
  }
  const user = await prisma.User.update({
    where: { id: Number(id) },
    data: {
      role: newRole
    }
  });
  return user;
};

const generatePassword = async (req) => {
  var result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (var i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const verifyPassword = async (req) => {
  const { userEmail, currentPassword, newPassword } = req;
  let user = await findUserByEmail({ email: userEmail });
  const is_equal = await bcrypt.compare(currentPassword, user.password);
  if (is_equal) {
    user = await prisma.User.update({
      where: { id: user.id },
      data: {
        password: await bcrypt.hash(newPassword, 10),
        isVerified: true
      }
    });
  }
  return is_equal;
};

const changePassword = async (req) => {
  const { updatedUser } = req;
  user = await prisma.User.update({
    where: { id: Number(updatedUser.id) },
    data: {
      password: await bcrypt.hash(updatedUser.password, 10),
      isVerified: false
    }
  });
  return user;
};

const updateB2BUserStatus = async (req) => {
  const { id, status } = req;
  const user = await prisma.User.update({
    where: { id: Number(id) },
    data: {
      status
    }
  });
  return user;
};

const createJobRole = async (req) => {
  const { jobRole } = req;
  const job = await prisma.JobRole.create({
    data: {
      jobRole
    }
  });
  return job;
};

const editJobRole = async (req) => {
  const { id, jobRole } = req;
  const job = await prisma.JobRole.update({
    where: { id: Number(id) },
    data: {
      jobRole
    }
  });
  return job;
};

const getJobRole = async (req) => {
  const { id } = req;
  const job = await prisma.JobRole.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      usersInJobRole: true
    }
  });
  return job;
};

const getJobRoleByName = async (req) => {
  const { jobRole } = req;
  const job = await prisma.JobRole.findUnique({
    where: {
      jobRole
    }
  });
  return job;
};

const addJobRolesToUser = async (req) => {
  const { userId, jobRoles } = req;
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      jobRoles: {
        set: [],
        connectOrCreate: jobRoles.map((j) => ({
          where: {
            jobRole: j.jobRole
          },
          create: {
            jobRole: j.jobRole
          }
        }))
      }
    },
    include: {
      jobRoles: true
    }
  });
  return user;
};

const deleteJobRole = async (req) => {
  const { id } = req;
  jobRole = await prisma.JobRole.delete({
    where: {
      id: Number(id)
    }
  });
  return id;
};

exports.createUser = createUser;
exports.getUsers = getUsers;
exports.findUserById = findUserById;
exports.findUserByEmail = findUserByEmail;
exports.getUserDetails = getUserDetails;
exports.editUser = editUser;
exports.deleteUserById = deleteUserById;
exports.enableUser = enableUser;
exports.disableUser = disableUser;
exports.changeUserRole = changeUserRole;
exports.generatePassword = generatePassword;
exports.verifyPassword = verifyPassword;
exports.changePassword = changePassword;
exports.updateB2BUserStatus = updateB2BUserStatus;
exports.getB2BUsers = getB2BUsers;
exports.getEmployees = getEmployees;
exports.createJobRole = createJobRole;
exports.editJobRole = editJobRole;
exports.getJobRole = getJobRole;
exports.getJobRoleByName = getJobRoleByName;
exports.addJobRolesToUser = addJobRolesToUser;
exports.deleteJobRole = deleteJobRole;
