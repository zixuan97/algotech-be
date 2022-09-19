const supplierModel = require('../models/supplierModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createSupplier = async (req, res) => {
  const { email, name, address } = req.body;
  var supplierEmails = [];
  const suppliers = await supplierModel.getAllSuppliers({});
  suppliers.map((s) => supplierEmails.push(s.email));
  // if exists throw error
  if (supplierEmails.includes(email)) {
    log.error('ERR_PRODUCT_CREATE-SUPPLIER');
    res.status(400).json({ message: 'Supplier already exists' });
  } else {
    const { error } = await common.awaitWrap(
      supplierModel.createSupplier({
        email,
        name,
        address
      })
    );
    if (error) {
      log.error('ERR_SUPPLIER_CREATE-SUPPLIER', error.message);
      res.json(Error.http(error));
    } else {
      log.out('OK_SUPPLIER_CREATE-SUPPLIER');
      res.json({ message: 'supplier created' });
    }
  }
};

const getAllSuppliers = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    supplierModel.getAllSuppliers({})
  );

  if (error) {
    log.error('ERR_SUPPLIER_GET-ALL-SUPPLIERS', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_SUPPLIER_GET-ALL-SUPPLIERS');
    res.json(data);
  }
};

const getSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await supplierModel.findSupplierById({ id });
    log.out('OK_SUPPLIER_GET-SUPPLIER-BY-ID');
    res.json(supplier);
  } catch (error) {
    log.error('ERR_SUPPLIER_GET-SUPPLIER', error.message);
    res.status(500).send('Server Error');
  }
};

const getSupplierByName = async (req, res) => {
  try {
    const { name } = req.body;
    const supplier = await supplierModel.findSupplierByName({ name });
    log.out('OK_SUPPLIER_GET-SUPPLIER-BY-ID');
    res.json(supplier);
  } catch (error) {
    log.error('ERR_SUPPLIER_GET-SUPPLIER', error.message);
    res.status(500).send('Server Error');
  }
};

const updateSupplier = async (req, res) => {
  const { id, email, name, address } = req.body;
  const { error } = await common.awaitWrap(
    supplierModel.updateSupplier({ id, email, name, address })
  );
  if (error) {
    log.error('ERR_SUPPLIER_UPDATE_SUPPLIER', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_SUPPLIER_UPDATE_SUPPLIER');
    res.json({ message: `Updated supplier with id:${id}` });
  }
};

const deleteSupplier = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(
    supplierModel.deleteSupplier({ id })
  );
  if (error) {
    log.error('ERR_SUPPLIER_DELETE_SUPPLIER', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_SUPPLIER_DELETE_SUPPLIER');
    res.json({ message: `Deleted supplier with id:${id}` });
  }
};

exports.createSupplier = createSupplier;
exports.getAllSuppliers = getAllSuppliers;
exports.updateSupplier = updateSupplier;
exports.deleteSupplier = deleteSupplier;
exports.getSupplier = getSupplier;
exports.getSupplierByName = getSupplierByName;
