const { Prisma } = require('@prisma/client');

const http = (err) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return { code: err.code, message: err.message };
  }
};

exports.http = http;
