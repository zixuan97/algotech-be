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

const getAllCategories = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    categoryModel.getAllcategories({})
  );

  if (error) {
    res.json(Error.http(error));
  } else {
    res.json({ data, message: 'Retrieved all categories' });
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
    res.json({ data, message: 'Retrieved all categories' });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.body;
  console.log('hello');
  const { error } = await common.awaitWrap(
    categoryModel.deleteCategory({ id })
  );
  if (error) {
    res.json(Error.http(error));
  } else {
    res.json({ message: `Deleted category with id ${id}` });
  }
};

exports.create = create;
exports.getAllCategories = getAllCategories;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
