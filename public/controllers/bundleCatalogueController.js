const bundleCatalogueModel = require('../models/bundleCatalogueModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { uploadS3, getS3, deleteS3 } = require('../helpers/s3');

const createBundleCatalogue = async (req, res) => {
  let { price, bundle, image, description } = req.body;
  price = JSON.parse(price);
  bundle = JSON.parse(bundle);
  // if (image) {
  //   try {
  //     await uploadS3({
  //       key: `bundleCatalogueImages/${bundle.name}-img`,
  //       payload: image
  //     });
  //   } catch (uploadS3Error) {
  //     log.error('ERR_BUNDLECAT_UPLOAD-S3', uploadS3Error.message);
  //   }
  // }

  const file = req.files;
  if (file) {
    const fileJSON = JSON.parse(JSON.stringify(file));
    const payload = Buffer.from(Object.values(fileJSON)[0].data.data, 'utf-8');
    try {
      await uploadS3({
        key: `bundleCatalogueImages/${bundle.name}-img`,
        payload: payload
      });
    } catch (uploadS3Error) {
      log.error('ERR_BUNDLECAT_UPLOAD-S3', {
        err: uploadS3Error.message,
        req: { body: req.body, params: req.params }
      });
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
    log.error('ERR_BUNDLECAT_CREATE-BUNDLECAT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_BUNDLECAT_CREATE-BUNDLECAT', {
      req: { body: req.body, params: req.params },
      res: { message: 'Bundle catalogue created' }
    });
    return res.json({ message: 'Bundle catalogue created' });
  }
};

const getAllBundleCatalogue = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    bundleCatalogueModel.getAllBundleCatalogue({})
  );
  if (error) {
    log.error('ERR_BUNDLECAT_GET-ALL-BUNDLECAT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    await Promise.all(
      data.map(async (bundleCatalogue) => {
        // const { data: productImg, error: getS3Error } = await common.awaitWrap(
        //   getS3({
        //     key: `bundleCatalogueImages/${bundleCatalogue.bundle.name}-img`
        //   })
        // );

        // if (getS3Error) {
        //   log.error('ERR_BUNDLECAT_GET-S3', getS3Error.message);
        // }

        // bundleCatalogue.image = productImg;
        var replaced = bundleCatalogue.bundle.name.replace(/ /g, '+');
        bundleCatalogue.image = `https://thekettlegourmet.s3.ap-southeast-1.amazonaws.com/bundleCatalogueImages/${replaced}-img`;
        log.out('OK_BUNDLECAT_GET-ALL-BUNDLECAT', {
          req: { body: req.body, params: req.params },
          res: JSON.stringify(data)
        });
      })
    );
    return res.json(data);
  }
};

const getBundleCatalogue = async (req, res) => {
  try {
    const { id } = req.params;
    const bundleCatalogue = await bundleCatalogueModel.findBundleCatalogueById({
      id
    });
    // const { data: productImg, error: getS3Error } = await common.awaitWrap(
    //   getS3({
    //     key: `bundleCatalogueImages/${bundleCatalogue.bundle.name}-img`
    //   })
    // );

    // if (getS3Error) {
    //   log.error('ERR_BUNDLECAT_GET-S3', getS3Error.message);
    // }
    // bundleCatalogue.image = productImg;
    bundleCatalogue.image = `https://thekettlegourmet.s3.ap-southeast-1.amazonaws.com/bundleCatalogueImages/${bundleCatalogue.bundle.name}-img`;
    log.out('OK_BUNDLECAT_GET-BUNDLECAT-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(bundleCatalogue)
    });
    return res.json(bundleCatalogue);
  } catch (error) {
    log.error('ERR_BUNDLECAT_GET-BUNDLECAT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting bundle catalogue');
  }
};

const updateBundleCatalogue = async (req, res) => {
  let { id, price, image, bundle, description } = req.body;
  id = JSON.parse(id);
  price = JSON.parse(price);
  bundle = JSON.parse(bundle);
  // if (image) {
  //   const { error: uploadS3Error } = await common.awaitWrap(
  //     uploadS3({
  //       key: `bundleCatalogueImages/${bundle.name}-img`,
  //       payload: image
  //     })
  //   );
  //   if (uploadS3Error) {
  //     log.error('ERR_BUNDLECAT_UPLOAD-S3', {
  //       err: uploadS3Error.message,
  //       req: { body: req.body, params: req.params }
  //     });
  //   }
  //   log.out('OK_BUNDLECAT_UPLOAD-S3');
  const file = req.files;
  if (file) {
    const fileJSON = JSON.parse(JSON.stringify(file));
    const payload = Buffer.from(Object.values(fileJSON)[0].data.data, 'utf-8');
    try {
      await uploadS3({
        key: `bundleCatalogueImages/${bundle.name}-img`,
        payload: payload
      });
    } catch (uploadS3Error) {
      log.error('ERR_BUNDLECAT_UPLOAD-S3', {
        err: uploadS3Error.message,
        req: { body: req.body, params: req.params }
      });
    }
  } else {
    const { error: deleteS3Error } = await common.awaitWrap(
      deleteS3({
        key: `bundleCatalogueImages/${bundle.name}-img`
      })
    );
    if (deleteS3Error) {
      log.error('ERR_BUNDLECAT_DELETE-S3', {
        err: deleteS3Error.message,
        req: { body: req.body, params: req.params }
      });
    }
    log.out('OK_BUNDLECAT_DELETE-S3');
  }
  const { error } = await common.awaitWrap(
    bundleCatalogueModel.updateBundleCatalogue({ id, price, description })
  );

  if (error) {
    log.error('ERR_BUNDLECAT_UPDATE_BUNDLECAT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_BUNDLECAT_UPDATE_BUNDLECAT', {
      req: { body: req.body, params: req.params },
      res: { message: `Updated bundle catalogue with id:${id}` }
    });
    return res.json({ message: `Updated bundle catalogue with id:${id}` });
  }
};

const deleteBundleCatalogue = async (req, res) => {
  const { id } = req.params;
  const bundleCatalogue = await bundleCatalogueModel.findBundleCatalogueById({
    id
  });
  const { error } = await common.awaitWrap(
    bundleCatalogueModel.deleteBundleCatalogue({ id })
  );
  if (error) {
    log.error('ERR_BUNDLECAT_DELETE_BUNDLECAT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    const { error: deleteS3Error } = await common.awaitWrap(
      deleteS3({
        key: `bundleCatalogueImages/${bundleCatalogue.bundle.name}-img`
      })
    );
    if (deleteS3Error) {
      log.error('ERR_BUNDLECAT_DELETE-S3', {
        err: deleteS3Error.message,
        req: { body: req.body, params: req.params }
      });
    }
    log.out('OK_BUNDLECAT_DELETE-S3');
    log.out('OK_BUNDLECAT_DELETE_BUNDLECAT', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted bundle catalogue with id:${id}` }
    });
    return res.json({ message: `Deleted bundle catalogue with id:${id}` });
  }
};

exports.createBundleCatalogue = createBundleCatalogue;
exports.getBundleCatalogue = getBundleCatalogue;
exports.updateBundleCatalogue = updateBundleCatalogue;
exports.deleteBundleCatalogue = deleteBundleCatalogue;
exports.getAllBundleCatalogue = getAllBundleCatalogue;
