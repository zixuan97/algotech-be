const categoryModel = require('../models/categoryModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createCategory = async (req, res) => {
  const { name } = req.body;
  const category = await categoryModel.findCategoryByName({ name });
  if (category) {
    log.error('ERR_USER_CREATE-CATEGORY');
    res.status(400).json({ message: 'Category already exists' });
  } else {
    const { error } = await common.awaitWrap(
      categoryModel.createCategory({
        name
      })
    );
    if (error) {
      log.error('ERR_CATEGORY_CREATE-CATEGORY', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_CATEGORY_CREATE-CATEGORY');
      res.json({ message: 'category created' });
    }
  }
};

const getAllCategories = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    categoryModel.getAllCategories({})
  );

  if (error) {
    log.error('ERR_CATEGORY_GET-ALL-CATEGORIES', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_CATEGORY_GET-ALL-CATEGORIES');
    res.json(data);
  }
};

const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findCategoryById({ id });
    log.out('OK_CATEGORY_GET-CATEGORY-BY-ID');
    res.json(category);
  } catch (error) {
    log.error('ERR_CATEGORY_GET-CATEGORY', error.message);
    res.status(500).send('Server Error');
  }
};

const getCategoryByName = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await categoryModel.findCategoryByName({ name });
    log.out('OK_CATEGORY_GET-CATEGORY-BY-ID');
    res.json(category);
  } catch (error) {
    log.error('ERR_CATEGORY_GET-CATEGORY', error.message);
    res.status(500).send('Server Error');
  }
};

const updateCategory = async (req, res) => {
  const { id, name } = req.body;
  const category = await categoryModel.findCategoryByName({ name });
  if (category && category.id != id) {
    log.error('ERR_USER_CREATE-CATEGORY');
    res.status(400).json({ message: 'Category already exists' });
  } else {
    const { error } = await common.awaitWrap(
      categoryModel.updateCategory({ id, name })
    );
    if (error) {
      log.error('ERR_CATEGORY_UPDATE_CATEGORY', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_CATEGORY_UPDATE_CATEGORY');
      res.json({ message: `Updated category with id:${id}` });
    }
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(
    categoryModel.deleteCategory({ id })
  );
  if (error) {
    log.error('ERR_CATEGORY_DELETE_CATEGORY', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
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
exports.getCategoryByName = getCategoryByName;
