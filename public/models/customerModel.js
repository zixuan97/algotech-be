const { prisma } = require('./index.js');

const createCustomer = async (req) => {
  const {
    firstName,
    lastName,
    company,
    email,
    address,
    postalCode,
    contactNo
  } = req;

  await prisma.customer.create({
    data: {
      firstName,
      lastName,
      company,
      email,
      address,
      postalCode,
      contactNo
    }
  });
};

const getAllCustomers = async () => {
  const customers = await prisma.customer.findMany({});
  return customers;
};

const updateCustomer = async (req) => {
  const {
    id,
    firstName,
    lastName,
    company,
    email,
    address,
    postalCode,
    contactNo,
    totalSpent,
    ordersCount,
    acceptsMarketing
  } = req;

  const customer = await prisma.customer.update({
    where: { id: Number(id) },
    data: {
      firstName,
      lastName,
      company,
      email,
      address,
      postalCode,
      contactNo,
      totalSpent,
      ordersCount,
      acceptsMarketing
    }
  });
  return customer;
};

const deleteCustomer = async (req) => {
  const { id } = req;
  await prisma.customer.delete({
    where: {
      id: Number(id)
    }
  });
};

const findCustomerById = async (req) => {
  const { id } = req;
  const customer = await prisma.customer.findUnique({
    where: {
      id: Number(id)
    }
  });
  return customer;
};

const findCustomerByEmail = async (req) => {
  const { email } = req;
  const customer = await prisma.customer.findUnique({
    where: {
      email
    }
  });
  return customer;
};

exports.createCustomer = createCustomer;
exports.getAllCustomers = getAllCustomers;
exports.updateCustomer = updateCustomer;
exports.deleteCustomer = deleteCustomer;
exports.findCustomerById = findCustomerById;
exports.findCustomerByEmail = findCustomerByEmail;
