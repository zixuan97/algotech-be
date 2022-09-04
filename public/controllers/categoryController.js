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
  const { id, name, description } = req.body;
  const { data, error } = await common.awaitWrap(
    categoryModel.updateCategory({ id, name, description })
  );
  if (error) {
    res.json(Error.http(error));
  } else {
    res.json({ data, message: 'Retrieved all categorys' });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.body;
  const { data, error } = await common.awaitWrap(
    categoryModel.deleteCategory({ id })
  );
  if (error) {
    res.json(Error.http(error));
  } else {
    res.json({ message: `Deleted category with id ${id}` });
  }
};

exports.create = create;
exports.getAllcategorys = getAllcategorys;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
