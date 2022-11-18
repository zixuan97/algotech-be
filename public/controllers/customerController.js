const customerModel = require('../models/customerModel');
const salesOrderModel = require('../models/salesOrderModel');
const bulkOrderModel = require('../models/bulkOrderModel');
const { generateSalesOrderExcel } = require('../helpers/excel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { format } = require('date-fns');

const createCustomer = async (req, res) => {
  const {
    firstName,
    lastName,
    company,
    email,
    address,
    postalCode,
    contactNo,
    lastOrderDate
  } = req.body;
  const { data, error: duplicateCustomerEmailError } = await common.awaitWrap(
    customerModel.findCustomerByEmail({ email })
  );
  if (data) {
    log.error('ERR_CUSTOMER_CREATE-CUSTOMER');
    return res.status(400).json({ message: 'Customer email already exists' });
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
        contactNo,
        lastOrderDate
      })
    );

    if (error) {
      log.error('ERR_CUSTOMER_CREATE-CUSTOMER', error.message);
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_CUSTOMER_CREATE-CUSTOMER');
      return res.json({ message: 'Customer created' });
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
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_CUSTOMER_GET-ALL-CUSTOMERS');
    return res.json(data);
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customerModel.findCustomerById({ id });
    const salesOrders = await salesOrderModel.findSalesOrderByCustomerEmail({
      customerEmail: customer.email
    });
    const bulkOrders = await bulkOrderModel.findBulkOrderByEmail({
      payeeEmail: customer.email
    });
    const ordersByMonth = await salesOrderModel.getOrdersByMonthForCustomer({
      customerEmail: customer.email
    });
    const bulkOrdersByMonth =
      await bulkOrderModel.getBulkOrdersByMonthForCustomer({
        payeeEmail: customer.email
      });
    customer.ordersByMonth = JSON.parse(
      JSON.stringify(
        ordersByMonth,
        (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
      )
    );
    customer.bulkOrdersByMonth = JSON.parse(
      JSON.stringify(
        bulkOrdersByMonth,
        (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
      )
    );
    customer.salesOrders = salesOrders;
    customer.bulkOrders = bulkOrders;

    log.out('OK_CUSTOMER_GET-CUSTOMER-BY-ID');
    return res.json(customer);
  } catch (error) {
    log.error('ERR_CUSTOMER_GET-CUSTOMER', error.message);
    return res.status(400).json({ message: 'Error getting customer' });
  }
};

const getCustomerByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const customer = await customerModel.findCustomerByEmail({ email });
    const salesOrders = await salesOrderModel.findSalesOrderByCustomerEmail({
      customerEmail: email
    });
    const ordersByMonth = await salesOrderModel.getOrdersByMonthForCustomer({
      customerEmail: customer.email
    });
    const bulkOrders = await bulkOrderModel.findBulkOrderByEmail({
      payeeEmail: customer.email
    });
    customer.ordersByMonth = JSON.parse(
      JSON.stringify(
        ordersByMonth,
        (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
      )
    );
    const bulkOrdersByMonth =
      await bulkOrderModel.getBulkOrdersByMonthForCustomer({
        payeeEmail: customer.email
      });

    customer.bulkOrdersByMonth = JSON.parse(
      JSON.stringify(
        bulkOrdersByMonth,
        (key, value) => (typeof value === 'bigint' ? Number(value) : value) // return everything else unchanged
      )
    );
    customer.salesOrders = salesOrders;
    customer.bulkOrders = bulkOrders;
    log.out('OK_CUSTOMER_GET-CUSTOMER-BY-ID');
    return res.json(customer);
  } catch (error) {
    log.error('ERR_CUSTOMER_GET-CUSTOMER', error.message);
    return res.status(400).json({ message: 'Error getting customer' });
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
    acceptsMarketing,
    lastOrderDate
  } = req.body;
  const { data, error: duplicateCustomerEmailError } = await common.awaitWrap(
    customerModel.findCustomerByEmail({ email })
  );
  if (data && data.id != id) {
    log.error('ERR_CUSTOMER_UPDATE-CUSTOMER');
    return res.status(400).json({ message: 'Customer email already exists' });
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
        acceptsMarketing,
        lastOrderDate
      })
    );
    if (error) {
      log.error('ERR_CUSTOMER_UPDATE_CUSTOMER', error.message);
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_CUSTOMER_UPDATE_CUSTOMER');
      return res.json({ message: `Updated customer with id:${id}` });
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
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_CUSTOMER_DELETE_CUSTOMER');
    return res.json({ message: `Deleted customer with id:${id}` });
  }
};

const generateExcel = async (req, res) => {
  const { customerEmail } = req.body;
  const salesOrders = await salesOrderModel.findSalesOrderByCustomerEmail({
    customerEmail
  });
  await generateSalesOrderExcel({ salesOrders })
    .then((blob) => {
      const timeElapsed = Date.now();
      const today = new Date(timeElapsed);
      res.type(blob.type);
      blob.arrayBuffer().then((buf) => {
        res.setHeader(
          'Content-disposition',
          `attachment; filename = CustomerOrders${format(
            today,
            'yyyyMMdd'
          )}.xlsx`
        );
        res.send(Buffer.from(buf));
      });
    })
    .catch((error) => {
      return res.status(400).json(error.message);
    });
};

const findCustomerByFilter = async (req, res) => {
  const {
    daysSinceLastPurchase,
    minAvgOrderValue,
    maxAvgOrderValue,
    allTimeOrderValue
  } = req.body;

  try {
    const customers = await customerModel.findCustomerByFilter({
      daysSinceLastPurchase,
      minAvgOrderValue,
      maxAvgOrderValue,
      allTimeOrderValue
    });

    // log.out('OK_CUSTOMERS_FIND-CUSTOMERS-BY-FILTER', {
    //   req: { body: req.body, params: req.params },
    //   res: customers
    // });
    return res.json({ customers });
  } catch (error) {
    log.error('ERR_CUSTOMERS_FIND-CUSTOMERS-BY-FILTER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

exports.createCustomer = createCustomer;
exports.getAllCustomers = getAllCustomers;
exports.updateCustomer = updateCustomer;
exports.deleteCustomer = deleteCustomer;
exports.getCustomerById = getCustomerById;
exports.getCustomerByEmail = getCustomerByEmail;
exports.generateExcel = generateExcel;
exports.findCustomerByFilter = findCustomerByFilter;
