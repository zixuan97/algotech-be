const bundleModel = require('../models/bundleModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const productModel = require('../models/productModel');

const createBundle = async (req, res) => {
  const { name, description, products } = req.body;
  // check if bundle name exists
  const { data: bundleName } = await common.awaitWrap(
    bundleModel.findBundleByName({ name })
  );

  // if exists throw error
  if (bundleName) {
    log.error('ERR_BUNDLE_CREATE-BUNDLE');
    res.status(400).json({ message: 'Bundle name already exists' });
  } else {
    const { error } = await common.awaitWrap(
      bundleModel.createBundle({
        name,
        description,
        products
      })
    );

    if (error) {
      log.error('ERR_BUNDLE_CREATE-BUNDLE', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_BUNDLE_CREATE-BUNDLE');
      res.json({ message: 'Bundle created' });
    }
  }
};

const getAllBundles = async (req, res) => {
  const { data, error } = await common.awaitWrap(bundleModel.getAllBundles({}));

  if (error) {
    log.error('ERR_BUNDLE_GET-ALL-BUNDLES', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_BUNDLE_GET-ALL-BUNDLES');
    res.json(data);
  }
};

const getBundleById = async (req, res) => {
  try {
    const { id } = req.params;
    const bundle = await bundleModel.findBundleById({ id });
    if (bundle) {
      const { data } = await common.awaitWrap(
        productModel.getAllProductsByBundle({ bundleId: id })
      );
      const result = await data.map((product) => {
        product.category = product.productCategory;
        delete product.productCategory;
        return {
          ...product,
          category: product.category.map((category) => category.category)
        };
      });
      bundle.products = result;
    }
    log.out('OK_BUNDLE_GET-BUNDLE-BY-ID');
    res.json(bundle);
  } catch (error) {
    log.error('ERR_BUNDLE_GET-BUNDLE', error.message);
    res.status(500).send('Server Error');
  }
};

const getBundleByName = async (req, res) => {
  try {
    const { name } = req.body;
    const bundle = await bundleModel.findBundleByName({ name });
    if (bundle) {
      const { data } = await common.awaitWrap(
        productModel.getAllProductsByBundle({ bundleId: id })
      );
      const result = await data.map((product) => {
        product.category = product.productCategory;
        delete product.productCategory;
        return {
          ...product,
          category: product.category.map((category) => category.category)
        };
      });
      bundle.products = result;
    }
    log.out('OK_BUNDLE_GET-BUNDLE-BY-NAME');
    res.json(bundle);
  } catch (error) {
    log.error('ERR_BUNDLE_GET-BUNDLE', error.message);
    res.status(500).send('Server Error');
  }
};

const updateBundle = async (req, res) => {
  const { id, name, description } = req.body;
  const { data: bundle } = await common.awaitWrap(
    bundleModel.findBundleByName({ name })
  );

  // if exists throw error
  if (bundle && bundle.id != id) {
    log.error('ERR_BUNDLE_CREATE-BUNDLE');
    res.status(400).json({ message: 'Bundle name already exists' });
  } else {
    const { error } = await common.awaitWrap(
      bundleModel.updateBundle({
        id,
        name,
        description
      })
    );
    if (error) {
      log.error('ERR_BUNDLE_UPDATE-BUNDLE', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_BUNDLE_UPDATE-BUNDLE');
      res.json({ message: `Updated bundle with id:${id}` });
    }
  }
};

const deleteBundle = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(bundleModel.deleteBundle({ id }));
  if (error) {
    log.error('ERR_BUNDLE_DELETE-BUNDLE', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_BUNDLE_DELETE-BUNDLE');
    res.json({ message: `Deleted bundle with id:${id}` });
  }
};

exports.createBundle = createBundle;
exports.getAllBundles = getAllBundles;
exports.updateBundle = updateBundle;
exports.deleteBundle = deleteBundle;
exports.getBundleById = getBundleById;
exports.getBundleByName = getBundleByName;
