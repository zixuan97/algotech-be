const { mockDeep, mockReset } = require('jest-mock-extended');

const { prisma } = require('./');

jest.mock('./', () => ({
  //   __esModule: true,
  //   default: mockDeep(),
  prisma: mockDeep()
}));
const prismaMock = prisma;
beforeEach(() => {
  mockReset(prismaMock);
});

exports.prismaMock = prismaMock;
