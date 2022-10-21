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
    contactNo
  } = req;
  let encryptedPassword = '';
  if (role !== UserRole.B2B) {
    encryptedPassword = await bcrypt.hash(password, 10);
  } else {
    if (status === undefined) {
      status = UserStatus.PENDING;
    }
  }
  await prisma.User.create({
    data: {
      firstName,
      lastName,
      email,
      password: encryptedPassword,
      role,
      status,
      isVerified,
      company,
      contactNo
    }
  });
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
      contactNo: updatedUser.contactNo
    }
  });
  return user;
};

const deleteUserById = async (req) => {
  const { id } = req;
  const user = await prisma.User.delete({
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
