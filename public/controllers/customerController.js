const customerModel = require('../models/customerModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createCustomer = async (req, res) => {
  const {
    firstName,
    lastName,
    company,
    email,
    address,
    postalCode,
    contactNo
  } = req.body;
  const { data, error: duplicateCustomerEmailError } = await common.awaitWrap(
    customerModel.findCustomerByEmail({ email })
  );
  if (data) {
    log.error('ERR_CUSTOMER_CREATE-CUSTOMER');
    res.status(400).json({ message: 'Customer email already exists' });
  } else if (duplicateCustomerEmailError) {
    log.error('ERR_CUSTOMER_CREATE-CUSTOMER');
    res
      .status(400)
      .json(
        { message: 'Unable to find customer email' },
        duplicateCustomerEmailError.message
      );
  } else {
    const { error } = await common.awaitWrap(
      customerModel.createCustomer({
        firstName,
        lastName,
        company,
        email,
        address,
        postalCode,
        contactNo
      })
    );

    if (error) {
      log.error('ERR_CUSTOMER_CREATE-CUSTOMER', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_CUSTOMER_CREATE-CUSTOMER');
      res.json({ message: 'Customer created' });
    }
  }
};

const getAllCustomers = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    customerModel.getAllCustomers({})
  );

  if (error) {
    log.error('ERR_CUSTOMER_GET-ALL-CUSTOMERS', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_CUSTOMER_GET-ALL-CUSTOMERS');
    res.json(data);
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customerModel.findCustomerById({ id });
    log.out('OK_CUSTOMER_GET-CUSTOMER-BY-ID');
    res.json(customer);
  } catch (error) {
    log.error('ERR_CUSTOMER_GET-CUSTOMER', error.message);
    res.status(400).json({ message: 'Error getting customer' });
  }
};

const getCustomerByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const customer = await customerModel.findCustomerByEmail({ email });
    log.out('OK_CUSTOMER_GET-CUSTOMER-BY-ID');
    res.json(customer);
  } catch (error) {
    log.error('ERR_CUSTOMER_GET-CUSTOMER', error.message);
    res.status(400).json({ message: 'Error getting customer' });
  }
};

const updateCustomer = async (req, res) => {
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
  } = req.body;
  const { data, error: duplicateCustomerEmailError } = await common.awaitWrap(
    customerModel.findCustomerByEmail({ email })
  );
  if (data && data.id != id) {
    log.error('ERR_CUSTOMER_UPDATE-CUSTOMER');
    res.status(400).json({ message: 'Customer email already exists' });
  } else if (duplicateCustomerEmailError) {
    log.error('ERR_CUSTOMER_UPDATE-CUSTOMER');
    res
      .status(400)
      .json(
        { message: 'Unable to find customer email' },
        duplicateCustomerEmailError.message
      );
  } else {
    const { error } = await common.awaitWrap(
      customerModel.updateCustomer({
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
      })
    );
    if (error) {
      log.error('ERR_CUSTOMER_UPDATE_CUSTOMER', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_CUSTOMER_UPDATE_CUSTOMER');
      res.json({ message: `Updated customer with id:${id}` });
    }
  }
};

const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  const { error } = await common.awaitWrap(
    customerModel.deleteCustomer({ id })
  );
  if (error) {
    log.error('ERR_CUSTOMER_DELETE_CUSTOMER', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_CUSTOMER_DELETE_CUSTOMER');
    res.json({ message: `Deleted customer with id:${id}` });
  }
};

exports.createCustomer = createCustomer;
exports.getAllCustomers = getAllCustomers;
exports.updateCustomer = updateCustomer;
exports.deleteCustomer = deleteCustomer;
exports.getCustomerById = getCustomerById;
exports.getCustomerByEmail = getCustomerByEmail;
