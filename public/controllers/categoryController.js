const categoryModel = require('../models/categoryModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createCategory = async (req, res) => {
  const { name } = req.body;
  const { error } = await common.awaitWrap(
    categoryModel.createCategory({
      name
    })
  );

  if (error) {
    log.error('ERR_CATEGORY_CREATE-CATEGORY', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_CATEGORY_CREATE-CATEGORY');
    res.json({ message: 'category created' });
  }
};

const getAllCategories = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    categoryModel.getAllCategories({})
  );

  if (error) {
    log.error('ERR_CATEGORY_GET-ALL-CATEGORIES', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_CATEGORY_GET-ALL-CATEGORIES');
    res.json({ data, message: 'Retrieved all categories' });
  }
};

/**
 * Gets Category
 */
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findCategoryById({ id });
    res.json(category);
  } catch (error) {
    log.error('ERR_CATEGORY_GET-CATEGORY', error.message);
    res.status(500).send('Server Error');
  }
};

const updateCategory = async (req, res) => {
  const { id, name } = req.body;
  const { error } = await common.awaitWrap(
    categoryModel.updateCategory({ id, name })
  );
  if (error) {
    log.error('ERR_CATEGORY_UPDATE_CATEGORY', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_CATEGORY_UPDATE_CATEGORY');
    res.json({ message: `Updated category with id:${id}` });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(
    categoryModel.deleteCategory({ id })
  );
  if (error) {
    log.error('ERR_CATEGORY_DELETE_CATEGORY', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_CATEGORY_DELETE_CATEGORY');
    res.json({ message: `Deleted category with id:${id}` });
  }
};

exports.createCategory = createCategory;
exports.getAllCategories = getAllCategories;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.getCategory = getCategory;
