const { Prisma } = require('@prisma/client');

const http = (err) => {
  switch (err) {
    case err instanceof Prisma.PrismaClientKnownRequestError:
      return { code: 400, message: err.message };
    default:
      return { code: 400, message: err.message };
  }
};

exports.http = http;
