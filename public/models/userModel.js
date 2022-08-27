const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const create = async (req) => {
  const { email, password } = req;

  const res = await prisma.User.create({
    data: {
      email,
      password
    }
  });

  return res;
};

exports.create = create;
