const { prisma } = require('./index.js');

const createCustomer = async (req) => {
  const {
    firstName,
    lastName,
    company,
    email,
    address,
    postalCode,
    contactNo,
    totalSpent,
    lastOrderDate,
    daysSinceLastPurchase
  } = req;

  return await prisma.customer.create({
    data: {
      firstName,
      lastName,
      company,
      email,
      address,
      postalCode,
      contactNo,
      totalSpent: Number(totalSpent),
      lastOrderDate,
      daysSinceLastPurchase
    }
  });
};

const getAllCustomers = async () => {
  const customers = await prisma.customer.findMany({});
  return customers;
};

const connectOrCreateCustomer = async (req) => {
  const {
    firstName,
    lastName,
    company,
    email,
    address,
    postalCode,
    contactNo,
    totalSpent,
    acceptsMarketing,
    lastOrderDate,
    daysSinceLastPurchase
  } = req;

  return await prisma.customer.upsert({
    where: {
      email
    },
    update: {
      ordersCount: {
        increment: 1
      },
      totalSpent: {
        increment: Number(totalSpent)
      },
      acceptsMarketing,
      lastOrderDate,
      daysSinceLastPurchase
    },
    create: {
      firstName,
      lastName,
      company,
      email,
      address,
      postalCode,
      contactNo,
      totalSpent: Number(totalSpent),
      acceptsMarketing,
      lastOrderDate,
      daysSinceLastPurchase
    }
  });
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
    acceptsMarketing,
    daysSinceLastPurchase,
    lastOrderDate
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
      totalSpent: Number(totalSpent),
      ordersCount,
      acceptsMarketing,
      lastOrderDate,
      daysSinceLastPurchase
    }
  });
  return customer;
};

const deleteCustomer = async (req) => {
  const { id } = req;
  return await prisma.customer.delete({
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

const findCustomerByFilter = async (req) => {
  const {
    daysSinceLastPurchase,
    minAvgOrderValue,
    maxAvgOrderValue,
    allTimeOrderValue
  } = req;
  let customers = await prisma.customer.findMany({});
  if (daysSinceLastPurchase) {
    customers = customers.filter(
      (customer) => customer.daysSinceLastPurchase >= daysSinceLastPurchase
    );
  }

  if (allTimeOrderValue) {
    customers = customers.filter(
      (customer) => customer.totalSpent >= allTimeOrderValue
    );
  }
  if (minAvgOrderValue | maxAvgOrderValue) {
    customers = customers.filter((customer) => {
      return (
        customer.totalSpent / customer.ordersCount >= minAvgOrderValue &&
        customer.totalSpent / customer.ordersCount <= maxAvgOrderValue
      );
    });
  }
  return customers;
};

exports.createCustomer = createCustomer;
exports.getAllCustomers = getAllCustomers;
exports.updateCustomer = updateCustomer;
exports.deleteCustomer = deleteCustomer;
exports.findCustomerById = findCustomerById;
exports.findCustomerByEmail = findCustomerByEmail;
exports.connectOrCreateCustomer = connectOrCreateCustomer;
exports.findCustomerByFilter = findCustomerByFilter;
