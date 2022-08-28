const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const common = require('@kelchy/common');

const prisma = new PrismaClient();

const create = async (req) => {
  const { email, password } = req;
  encryptedPassword = await bcrypt.hash(password, 10);

  const { error } = await common.awaitWrap(
    prisma.User.create({
      data: {
        email,
        password: encryptedPassword
      }
    })
  );
  if (error) {
    throw error;
  }
};

const findUserByEmail = async (req) => {
  const { email } = req;
  const user = await prisma.User.findUnique({
    where: {
      email
    }
  });

  return user;
};

exports.create = create;
exports.findUserByEmail = findUserByEmail;
