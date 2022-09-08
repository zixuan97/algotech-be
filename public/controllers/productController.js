const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createProduct = async (req, res) => {
  const { sku, name, description, image, categories, brand_id } = req.body;
  // check if product exists
  const { data: product } = await common.awaitWrap(
    productModel.findProductBySku({ sku })
  );
  // if exists throw error
  if (product) {
    log.error('ERR_PRODUCT_CREATE-PRODUCT');
    res.json({ message: 'Product sku already exists' });
  } else {
    // find or create category
    const { error: connectOrCreateCategoryError } = await common.awaitWrap(
      categoryModel.connectOrCreateCategory({ categories })
    );
    if (connectOrCreateCategoryError) {
      log.error(
        'ERR_CATEGORY_CREATE-CATEGORY',
        connectOrCreateCategoryError.message
      );
      res.json(Error.http(connectOrCreateCategoryError));
    }
    //connect to existing categories
    const { error } = await common.awaitWrap(
      productModel.createProduct({
        sku,
        name,
        description,
        image,
        brand_id,
        categories
      })
    );

    if (error) {
      log.error('ERR_PRODUCT_CREATE-PRODUCT', error.message);
      res.json(Error.http(error));
    } else {
      log.out('OK_PRODUCT_CREATE-PRODUCT');
      res.json({ message: 'product created' });
    }
  }
};

const getAllProducts = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    productModel.getAllProducts({})
  );

  if (error) {
    log.error('ERR_PRODUCT_GET-ALL-PRODUCTS', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_PRODUCT_GET-ALL-PRODUCTS');
    res.json({ data, message: 'Retrieved all products' });
  }
};

/**
 * Gets product
 */
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findProductById({ id });
    res.json(product);
  } catch (error) {
    log.error('ERR_PRODUCT_GET-PRODUCT', error.message);
    res.status(500).send('Server Error');
  }
};

const updateProduct = async (req, res) => {
  const { id, name, description, image, category_id } = req.body;
  const { error } = await common.awaitWrap(
    productModel.updateProduct({ id, name, description, image, category_id })
  );
  if (error) {
    log.error('ERR_PRODUCT_UPDATE-PRODUCT', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_PRODUCT_UPDATE-PRODUCT');
    res.json({ message: `Updated product with id:${id}` });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(productModel.deleteProduct({ id }));
  if (error) {
    log.error('ERR_PRODUCT_DELETE-PRODUCT', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_PRODUCT_DELETE-PRODUCT');
    res.json({ message: `Deleted product with id:${id}` });
  }
};

exports.createProduct = createProduct;
exports.getAllProducts = getAllProducts;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.getProduct = getProduct;
