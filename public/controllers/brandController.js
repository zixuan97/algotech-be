const brandModel = require('../models/brandModel');
const productModel = require('../models/productModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createBrand = async (req, res) => {
  const { name } = req.body;
  const { data, error: duplicateBrandNameError } = await common.awaitWrap(
    brandModel.findBrandByName({ name })
  );
  if (data) {
    log.error('ERR_BRAND_CREATE-BRAND', {
      err: { message: 'brand name already exist' },
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Brand name already exists' });
  } else if (duplicateBrandNameError) {
    log.error('ERR_BRAND_CREATE-BRAND', {
      err: duplicateBrandNameError.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Unable to find brand name' });
  } else {
    const { error } = await common.awaitWrap(
      brandModel.createBrand({
        name
      })
    );
    if (error) {
      log.error('ERR_BRAND_CREATE-BRAND', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_BRAND_CREATE-BRAND', {
        req: { body: req.body, params: req.params },
        res: { message: 'brand created' }
      });
      return res.json({ message: 'brand created' });
    }
  }
};

const getAllBrands = async (req, res) => {
  const { data, error } = await common.awaitWrap(brandModel.getAllBrands({}));

  if (error) {
    log.error('ERR_BRAND_GET-ALL-BRANDS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_BRAND_GET-ALL-BRANDS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await brandModel.findBrandById({ id });
    log.out('OK_BRAND_GET-BRAND-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(brand)
    });
    return res.json(brand);
  } catch (error) {
    log.error('ERR_BRAND_GET-BRAND-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting brand');
  }
};

const getBrandByName = async (req, res) => {
  try {
    const { name } = req.body;
    const brand = await brandModel.findBrandByName({ name });
    log.out('OK_BRAND_GET-BRAND-BY-NAME', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(brand)
    });
    return res.json(brand);
  } catch (error) {
    log.error('ERR_BRAND_GET-BRAND-BY-NAME', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting brand by name');
  }
};

const updateBrand = async (req, res) => {
  const { id, name } = req.body;
  const { data, error: duplicateBrandNameError } = await common.awaitWrap(
    brandModel.findBrandByName({ name })
  );
  if (data && data.id != id) {
    log.error('ERR_BRAND_UPDATE-BRAND', {
      err: 'ERR_BRAND_UPDATE-BRAND',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Brand name already exists' });
  } else if (duplicateBrandNameError) {
    log.error('ERR_BRAND_UPDATE-BRAND', {
      err: duplicateBrandNameError.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Unable to find brand name' });
  } else {
    const { error } = await common.awaitWrap(
      brandModel.updateBrands({ id, name })
    );
    if (error) {
      log.error('ERR_BRAND_UPDATE-BRAND', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_BRAND_UPDATE_BRAND', {
        req: { body: req.body, params: req.params },
        res: { message: `Updated brand with id:${id}` }
      });
      return res.json({ message: `Updated brand with id:${id}` });
    }
  }
};

const deleteBrand = async (req, res) => {
  const { id } = req.params;
  const { data: products, error: getAllProductsError } = await common.awaitWrap(
    productModel.getAllProductsByBrand({ brandId: id })
  );
  if (getAllProductsError) {
    log.error('ERR_BRAND_GET-ALL-PRODUCTS', {
      err: getAllProductsError.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(getAllProductsError);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_BRAND_GET-ALL-PRODUCTS');

    const { error: deleteProductsError } = await common.awaitWrap(
      Promise.all(
        products.map(async (product) => {
          await productModel.deleteProduct({ id: product.id });
        })
      )
    );
    if (deleteProductsError) {
      log.error('ERR_PRODUCT_DELETE-ALL-PRODUCTS', {
        err: deleteProductsError.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(deleteProductsError);
      return res.status(e.code).json(e.message);
    } else {
      const { error } = await common.awaitWrap(brandModel.deleteBrand({ id }));
      if (error) {
        log.error('ERR_BRAND_DELETE_BRAND', {
          err: error.message,
          req: { body: req.body, params: req.params }
        });
        const e = Error.http(error);
        return res.status(e.code).json(e.message);
      } else {
        log.out('OK_BRAND_DELETE_BRAND', {
          req: { body: req.body, params: req.params },
          res: { message: `Deleted brand with id:${id}` }
        });
        return res.json({ message: `Deleted brand with id:${id}` });
      }
    }
  }
};

exports.createBrand = createBrand;
exports.getAllBrands = getAllBrands;
exports.updateBrand = updateBrand;
exports.deleteBrand = deleteBrand;
exports.getBrand = getBrand;
exports.getBrandByName = getBrandByName;
