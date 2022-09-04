const { Prisma } = require('@prisma/client');

const http = (err) => {
  switch (err) {
    case err instanceof Prisma.PrismaClientKnownRequestError:
      return { code: err.code, message: err.message };
    default:
      return { code: 400, message: 'Server error' };
  }
};

exports.http = http;
