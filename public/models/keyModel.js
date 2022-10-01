const { prisma } = require('./index.js');

const createKey = async (req) => {
  const { key, value } = req;

  await prisma.keys.create({
    data: {
      key,
      value
    }
  });
};

const getAllKeys = async () => {
  const keys = await prisma.keys.findMany({});
  return brands;
};

const updateKeys = async (req) => {
  const { key, value } = req;

  const newKey = await prisma.keys.update({
    where: { key },
    data: {
      key,
      value
    }
  });
  return newKey;
};

const deleteKeys = async (req) => {
  const { id } = req;
  await prisma.keys.delete({
    where: {
      id: Number(id)
    }
  });
};

const findKeyByName = async (req) => {
  const { key } = req;
  const keyName = await prisma.keys.findUnique({
    where: {
      key
    }
  });
  return keyName;
};

exports.createKey = createKey;
exports.getAllKeys = getAllKeys;
exports.updateKeys = updateKeys;
exports.deleteKeys = deleteKeys;
exports.findKeyByName = findKeyByName;
