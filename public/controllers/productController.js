const productModel = require('../models/productModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');

const createProduct = async (req, res) => {
  const { name, description, image, category_id } = req.body;
  const { error } = await common.awaitWrap(
    productModel.createProduct({
      name,
      description,
      image,
      category_id
    })
  );

  if (error) {
    log.error('ERR_PRODUCT_CREATE-PRODUCT', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_PRODUCT_CREATE-PRODUCT');
    res.json({ message: 'product created' });
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
  const { error } = await common.awaitWrap(
    productModel.deleteProduct({ id: id })
  );
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
