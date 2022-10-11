const bundleCatalogueModel = require('../models/bundleCatalogueModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { uploadS3, getS3 } = require('../helpers/s3');

const createBundleCatalogue = async (req, res) => {
  const { price, bundle, image, description } = req.body;

  if (image) {
    try {
      await uploadS3({
        key: `bundleCatalogueImages/${bundle.name}-img`,
        payload: image
      });
    } catch (uploadS3Error) {
      log.error('ERR_BUNDLECAT_UPLOAD-S3', uploadS3Error.message);
      const e = Error.http(uploadS3Error);
      res.status(e.code).json(e.message);
    }
  }
  log.out('OK_BUNDLE_UPLOAD-S3');
  const { error } = await common.awaitWrap(
    bundleCatalogueModel.createBundleCatalogue({
      price,
      bundleId: bundle.id,
      description
    })
  );
  if (error) {
    log.error('ERR_BUNDLECAT_CREATE-BUNDLECAT', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_BUNDLECAT_CREATE-BUNDLECAT');
    res.json({ message: 'Bundle catalogue created' });
  }
};

const getAllBundleCatalogue = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    bundleCatalogueModel.getAllBundleCatalogue({})
  );

  await Promise.all(
    data.map(async (bundleCatalogue) => {
      const { data: productImg, error: getS3Error } = await common.awaitWrap(
        getS3({
          key: `bundleCatalogueImages/${bundleCatalogue.bundle.name}-img`
        })
      );

      if (getS3Error) {
        log.error('ERR_BUNDLECAT_GET-S3', getS3Error.message);
      }
      bundleCatalogue.image = productImg;
    })
  );

  if (error) {
    log.error('ERR_BUNDLECAT_GET-ALL-BUNDLECAT', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_BUNDLECAT_GET-ALL-BUNDLECAT');
    res.json(data);
  }
};

const getBundleCatalogue = async (req, res) => {
  try {
    const { id } = req.params;
    const bundleCatalogue = await bundleCatalogueModel.findBundleCatalogueById({
      id
    });
    const { data: productImg, error: getS3Error } = await common.awaitWrap(
      getS3({
        key: `bundleCatalogueImages/${bundleCatalogue.bundle.name}-img`
      })
    );

    if (getS3Error) {
      log.error('ERR_BUNDLECAT_GET-S3', getS3Error.message);
    }
    bundleCatalogue.image = productImg;
    log.out('OK_BUNDLECAT_GET-BUNDLECAT-BY-ID');
    res.json(bundleCatalogue);
  } catch (error) {
    log.error('ERR_BUNDLECAT_GET-BUNDLECAT', error.message);
    res.status(500).send('Server Error');
  }
};

const updateBundleCatalogue = async (req, res) => {
  const { id, price, image, bundle, description } = req.body;

  if (image) {
    const { error: uploadS3Error } = await common.awaitWrap(
      uploadS3({
        key: `bundleCatalogueImages/${bundle.name}-img`,
        payload: image
      })
    );
    if (uploadS3Error) {
      log.error('ERR_BUNDLECAT_UPLOAD-S3', uploadS3Error.message);
      const e = Error.http(uploadS3Error);
      res.status(e.code).json(e.message);
    }
    log.out('OK_BUNDLECAT_UPLOAD-S3');
  }
  const { error } = await common.awaitWrap(
    bundleCatalogueModel.updateBundleCatalogue({ id, price, description })
  );

  if (error) {
    log.error('ERR_BUNDLECAT_UPDATE_BUNDLECAT', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_BUNDLECAT_UPDATE_BUNDLECAT');
    res.json({ message: `Updated bundle catalogue with id:${id}` });
  }
};

const deleteBundleCatalogue = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(
    bundleCatalogueModel.deleteBundleCatalogue({ id })
  );
  if (error) {
    log.error('ERR_BUNDLECAT_DELETE_BUNDLECAT', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_BUNDLECAT_DELETE_BUNDLECAT');
    res.json({ message: `Deleted bundle category with id:${id}` });
  }
};

exports.createBundleCatalogue = createBundleCatalogue;
exports.getBundleCatalogue = getBundleCatalogue;
exports.updateBundleCatalogue = updateBundleCatalogue;
exports.deleteBundleCatalogue = deleteBundleCatalogue;
exports.getAllBundleCatalogue = getAllBundleCatalogue;
