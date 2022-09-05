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
    res.json(Error.http(error));
  } else {
    res.json({ message: 'product created' });
  }
};

const getAllProducts = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    productModel.getAllProducts({})
  );

  if (error) {
    res.json(Error.http(error));
  } else {
    res.json({ data, message: 'Retrieved all products' });
  }
};

const updateProduct = async (req, res) => {
  const { id, name, description, image, category_id } = req.body;
  const { error } = await common.awaitWrap(
    productModel.updateProduct({ id, name, description, image, category_id })
  );
  if (error) {
    res.json(Error.http(error));
  } else {
    res.json({ message: `Updated product with id:${id}` });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.body;
  const { error } = await common.awaitWrap(productModel.deleteProduct({ id }));
  if (error) {
    res.json(Error.http(error));
  } else {
    res.json({ message: `Deleted product with id:${id}` });
  }
};

exports.createProduct = createProduct;
exports.getAllProducts = getAllProducts;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
