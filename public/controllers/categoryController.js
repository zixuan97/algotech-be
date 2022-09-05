const categoryModel = require('../models/categoryModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');

const create = async (req, res) => {
  const { name, description } = req.body;
  const { error } = await common.awaitWrap(
    categoryModel.create({
      name,
      description
    })
  );

  if (error) {
    res.json(Error.http(error));
  } else {
    res.json({ message: 'category created' });
  }
};

const getAllcategorys = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    categoryModel.getAllcategorys({})
  );

  if (error) {
    res.json(Error.http(error));
  } else {
    res.json({ data, message: 'Retrieved all categorys' });
  }
};

const updateCategory = async (req, res) => {
  const { name, description } = req.body;
  const { data, error } = await common.awaitWrap(
    categoryModel.updateCategory({ name, description })
  );
};

exports.create = create;
exports.getAllcategorys = getAllcategorys;
exports.updateCategory = updateCategory;
