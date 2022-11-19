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
  const user = await prisma.user.create({
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
  const users = await prisma.user.findMany({});
  return users;
};

const getB2BUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      role: UserRole.B2B
    }
  });
  return users;
};

const getEmployees = async () => {
  const users = await prisma.user.findMany({
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
      manager: true,
      jobRoles: true,
      subordinates: true
    }
  });
  return users;
};

const getEmployeesForOrgChart = async () => {
  const users = await prisma.user.findMany({
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
      manager: true,
      jobRoles: true
    }
  });
  return users;
};

const findUserById = async (req) => {
  const { id } = req;
  const user = await prisma.user.findUnique({
    where: {
      id
    }
  });
  return user;
};

const findUserByEmail = async (req) => {
  const { email } = req;
  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });
  return user;
};

const getUserDetails = async (req) => {
  const { id } = req;
  const user = await prisma.user.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      jobRoles: true
    }
  });
  return user;
};

const editUser = async (req) => {
  const { updatedUser } = req;
  const id = updatedUser.id;
  user = await prisma.user.update({
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
      assignedSubjects: {
        deleteMany: {}
      },
      vettedLeaves: {
        deleteMany: {}
      }
    }
  });
  user = await prisma.user.delete({
    where: {
      id: Number(id)
    }
  });
  return id;
};

const enableUser = async (req) => {
  const { id } = req;
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: {
      status: UserStatus.ACTIVE
    }
  });
  return user;
};

const disableUser = async (req) => {
  const { id } = req;
  const user = await prisma.user.update({
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
  const user = await prisma.user.update({
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
    user = await prisma.user.update({
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
  user = await prisma.user.update({
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
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: {
      status
    }
  });
  return user;
};

const createJobRole = async (req) => {
  const { jobRole, description, usersInJobRole } = req;
  const job = await prisma.jobRole.create({
    data: {
      jobRole,
      description,
      usersInJobRole: {
        connect: usersInJobRole.map((u) => ({
          id: u.id
        }))
      }
    },
    include: {
      usersInJobRole: true
    }
  });
  return job;
};

const editJobRole = async (req) => {
  const { id, jobRole, description, usersInJobRole } = req;
  const job = await prisma.jobRole.update({
    where: { id: Number(id) },
    data: {
      jobRole,
      description,
      usersInJobRole: {
        set: [],
        connect: usersInJobRole.map((u) => ({
          id: u.id
        }))
      }
    },
    include: {
      usersInJobRole: true
    }
  });
  return job;
};

const getJobRole = async (req) => {
  const { id } = req;
  const job = await prisma.jobRole.findUnique({
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
  const job = await prisma.jobRole.findUnique({
    where: {
      jobRole
    },
    include: {
      usersInJobRole: true
    }
  });
  return job;
};

const getAllJobRoles = async (req) => {
  const jobroles = await prisma.jobRole.findMany({
    include: {
      usersInJobRole: true
    }
  });
  return jobroles;
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
            jobRole: j.jobRole,
            description: j.description
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
  jobRole = await prisma.jobRole.delete({
    where: {
      id: Number(id)
    }
  });
  return id;
};

const assignSubordinatesToManager = async (req) => {
  const { id, users } = req;
  const user = await prisma.user.update({
    where: { id },
    data: {
      subordinates: {
        connect: users.map((u) => ({
          id: u.id
        }))
      }
    },
    include: {
      manager: true,
      subordinates: true
    }
  });
  return user;
};

const unassignSubordinatesToManager = async (req) => {
  const { id, users } = req;
  const user = await prisma.user.update({
    where: { id },
    data: {
      subordinates: {
        disconnect: users.map((u) => ({
          id: u.id
        }))
      }
    },
    include: {
      manager: true,
      subordinates: true
    }
  });
  return user;
};

const setCEOMangerIdToOwnId = async (req) => {
  const { id } = req;
  const user = await prisma.user.update({
    where: { id },
    data: {
      managerId: id
    },
    include: {
      manager: true,
      subordinates: true
    }
  });
  return user;
};

const getCEO = async (req) => {
  const ceo = (await getEmployees({})).filter((e) => e.managerId === e.id);
  if (ceo.length === 0) {
    return null;
  } else {
    return ceo[0];
  }
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
exports.getEmployeesForOrgChart = getEmployeesForOrgChart;
exports.getEmployees = getEmployees;
exports.createJobRole = createJobRole;
exports.editJobRole = editJobRole;
exports.getJobRole = getJobRole;
exports.getJobRoleByName = getJobRoleByName;
exports.getAllJobRoles = getAllJobRoles;
exports.addJobRolesToUser = addJobRolesToUser;
exports.deleteJobRole = deleteJobRole;
exports.assignSubordinatesToManager = assignSubordinatesToManager;
exports.unassignSubordinatesToManager = unassignSubordinatesToManager;
exports.setCEOMangerIdToOwnId = setCEOMangerIdToOwnId;
exports.getCEO = getCEO;
