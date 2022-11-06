const { mockDeep } = require('jest-mock-extended');

exports.createMockContext = () => {
  return {
    prisma: mockDeep()
  };
};
