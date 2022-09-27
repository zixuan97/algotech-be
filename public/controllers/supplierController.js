const supplierModel = require('../models/supplierModel');
const productModel = require('../models/productModel');
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
    log.error('ERR_SUPPLIER_UPDATE-SUPPLIER', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_SUPPLIER_UPDATE-SUPPLIER');
    res.json({ message: `Updated supplier with id:${id}` });
  }
};

const deleteSupplier = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(
    supplierModel.deleteSupplier({ id })
  );
  if (error) {
    log.error('ERR_SUPPLIER_DELETE-SUPPLIER', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_SUPPLIER_DELETE-SUPPLIER');
    res.json({ message: `Deleted supplier with id:${id}` });
  }
};

const addProductToSupplier = async (req, res) => {
  const { supplierId, productId, rate } = req.body;
  const supplier = supplierModel.findSupplierById({ id: supplierId });
  const product = productModel.findProductById({ id: productId });
  if (!supplier || !product) {
    log.error('ERR_SUPPLIER_ADD-PRODUCT-TO-SUPPLIER', error.message);
    res.json({ "message" : "Supplier or product does not exist." });
  }
  const { data, error } = await common.awaitWrap(
    supplierModel.connectOrCreateSupplierProduct({ supplierId, productId, rate })
  );
  if (error) {
    log.error('ERR_SUPPLIER_ADD-PRODUCT-TO-SUPPLIER', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_SUPPLIER_ADD-PRODUCT-TO-SUPPLIER');
    res.json(data);
  }
};

const getAllSupplierProducts = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    supplierModel.getAllSupplierProducts({})
  );

  if (error) {
    log.error('ERR_SUPPLIER_GET-ALL-SUPPLIER-PRODUCTS', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_SUPPLIER_GET-ALL-SUPPLIER=PRODUCTS');
    res.json(data);
  }
};

exports.createSupplier = createSupplier;
exports.getAllSuppliers = getAllSuppliers;
exports.updateSupplier = updateSupplier;
exports.deleteSupplier = deleteSupplier;
exports.getSupplier = getSupplier;
exports.getSupplierByName = getSupplierByName;
exports.addProductToSupplier = addProductToSupplier;
exports.getAllSupplierProducts = getAllSupplierProducts;
