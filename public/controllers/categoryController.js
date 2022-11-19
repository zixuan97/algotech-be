const categoryModel = require('../models/categoryModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createCategory = async (req, res) => {
  const { name } = req.body;
  const category = await categoryModel.findCategoryByName({ name });
  if (category) {
    log.error('ERR_USER_CREATE-CATEGORY', {
      err: 'Category name already exist',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Category name already exist' });
  } else {
    const { error } = await common.awaitWrap(
      categoryModel.createCategory({
        name
      })
    );
    if (error) {
      log.error('ERR_CATEGORY_CREATE-CATEGORY', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_CATEGORY_CREATE-CATEGORY', {
        req: { body: req.body, params: req.params },
        res: { message: 'category created' }
      });
      return res.json({ message: 'category created' });
    }
  }
};

const getAllCategories = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    categoryModel.getAllCategories({})
  );

  if (error) {
    log.error('ERR_CATEGORY_GET-ALL-CATEGORIES', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_CATEGORY_GET-ALL-CATEGORIES', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findCategoryById({ id });
    log.out('OK_CATEGORY_GET-CATEGORY-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(category)
    });
    return res.json(category);
  } catch (error) {
    log.error('ERR_CATEGORY_GET-CATEGORY', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting category');
  }
};

const getCategoryByName = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await categoryModel.findCategoryByName({ name });
    log.out('OK_CATEGORY_GET-CATEGORY-BY-NAME', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(category)
    });
    return res.json(category);
  } catch (error) {
    log.error('ERR_CATEGORY_GET-CATEGORY-BY-NAME', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting category by name');
  }
};

const updateCategory = async (req, res) => {
  const { id, name } = req.body;
  const category = await categoryModel.findCategoryByName({ name });
  if (category && category.id != id) {
    log.error('ERR_USER_UPDATE-CATEGORY', {
      err: 'Category already exists',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Category already exists' });
  } else {
    const { error } = await common.awaitWrap(
      categoryModel.updateCategory({ id, name })
    );
    if (error) {
      log.error('ERR_CATEGORY_UPDATE_CATEGORY', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_CATEGORY_UPDATE_CATEGORY', {
        req: { body: req.body, params: req.params },
        res: { message: `Updated category with id:${id}` }
      });
      return res.json({ message: `Updated category with id:${id}` });
    }
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(
    categoryModel.deleteCategory({ id })
  );
  if (error) {
    log.error('ERR_CATEGORY_DELETE_CATEGORY', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_CATEGORY_DELETE_CATEGORY', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted category with id:${id}` }
    });
    return res.json({ message: `Deleted category with id:${id}` });
  }
};

exports.createCategory = createCategory;
exports.getAllCategories = getAllCategories;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.getCategory = getCategory;
exports.getCategoryByName = getCategoryByName;
