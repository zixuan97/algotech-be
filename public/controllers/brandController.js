const brandModel = require('../models/brandModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createBrand = async (req, res) => {
  const { name } = req.body;
  const { data, error: duplicateProductNameError } = await common.awaitWrap(
    brandModel.findBrandByName({ name })
  );
  if (data) {
    log.error('ERR_BRAND_CREATE-BRAND');
    res.json({ message: 'Brand name already exists' });
  } else if (duplicateProductNameError) {
    log.error('ERR_BRAND_CREATE-BRAND');
    res.json(
      { message: 'Unable to find brand name' },
      duplicateProductNameError.message
    );
  } else {
    const { error } = await common.awaitWrap(
      brandModel.createBrand({
        name
      })
    );

    if (error) {
      log.error('ERR_BRAND_CREATE-BRAND', error.message);
      res.json(Error.http(error));
    } else {
      log.out('OK_BRAND_CREATE-BRAND');
      res.json({ message: 'brand created' });
    }
  }
};

const getAllBrands = async (req, res) => {
  const { data, error } = await common.awaitWrap(brandModel.getAllBrands({}));

  if (error) {
    log.error('ERR_BRAND_GET-ALL-BRANDS', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_BRAND_GET-ALL-BRANDS');
    res.json({ data, message: 'Retrieved all brands' });
  }
};

const getBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await brandModel.findBrandById({ id });
    log.out('OK_BRAND_GET-BRAND-BY-ID');
    res.json(brand);
  } catch (error) {
    log.error('ERR_BRAND_GET-BRAND', error.message);
    res.status(500).send('Server Error');
  }
};

const getBrandByName = async (req, res) => {
  try {
    const { name } = req.body;
    const brand = await brandModel.findBrandByName({ name });
    log.out('OK_BRAND_GET-BRAND-BY-ID');
    res.json(brand);
  } catch (error) {
    log.error('ERR_BRAND_GET-BRAND', error.message);
    res.status(500).send('Server Error');
  }
};

const updateBrand = async (req, res) => {
  const { id, name } = req.body;
  const { error } = await common.awaitWrap(
    brandModel.updateBrands({ id, name })
  );
  if (error) {
    log.error('ERR_BRAND_UPDATE_BRAND', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_BRAND_UPDATE_BRAND');
    res.json({ message: `Updated brand with id:${id}` });
  }
};

const deleteBrand = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(brandModel.deleteBrand({ id }));
  if (error) {
    log.error('ERR_BRAND_DELETE_BRAND', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_BRAND_DELETE_BRAND');
    res.json({ message: `Deleted brand with id:${id}` });
  }
};

exports.createBrand = createBrand;
exports.getAllBrands = getAllBrands;
exports.updateBrand = updateBrand;
exports.deleteBrand = deleteBrand;
exports.getBrand = getBrand;
exports.getBrandByName = getBrandByName;
