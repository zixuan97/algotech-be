const categoryModel = require('../models/categoryModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');

const createCategory = async (req, res) => {
  const { name, description } = req.body;
  const { error } = await common.awaitWrap(
    categoryModel.createCategory({
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
    categoryModel.getAllCategories({})
  );

  if (error) {
    res.json(Error.http(error));
  } else {
    res.json({ data, message: 'Retrieved all categories' });
  }
};

const updateCategory = async (req, res) => {
  const { id, name, description } = req.body;
  const { error } = await common.awaitWrap(
    categoryModel.updateCategory({ id, name, description })
  );
  if (error) {
    res.json(Error.http(error));
  } else {
    res.json({ message: `Updated category with id:${id}` });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.body;
  const { error } = await common.awaitWrap(
    categoryModel.deleteCategory({ id })
  );
  if (error) {
    res.json(Error.http(error));
  } else {
    res.json({ message: `Deleted category with id:${id}` });
  }
};

exports.createCategory = createCategory;
exports.getAllCategories = getAllCategories;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
