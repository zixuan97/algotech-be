const bundleModel = require('../models/bundleModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createBundle = async (req, res) => {
  const { name, description, bundleProduct } = req.body;
  // check if bundle name exists
  const { data: bundleName } = await common.awaitWrap(
    bundleModel.findBundleByName({ name })
  );

  // if exists throw error
  if (bundleName) {
    log.error('ERR_BUNDLE_CREATE-BUNDLE', {
      err: { message: 'Bundle name already exists' },
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Bundle name already exists' });
  } else {
    const { error } = await common.awaitWrap(
      bundleModel.createBundle({
        name,
        description,
        bundleProduct
      })
    );

    if (error) {
      log.error('ERR_BUNDLE_CREATE-BUNDLE', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_BUNDLE_CREATE-BUNDLE', {
        req: { body: req.body, params: req.params },
        res: { message: 'Bundle created' }
      });
      return res.json({ message: 'Bundle created' });
    }
  }
};

const getAllBundles = async (req, res) => {
  const { data, error } = await common.awaitWrap(bundleModel.getAllBundles({}));

  if (error) {
    log.error('ERR_BUNDLE_GET-ALL-BUNDLES', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_BUNDLE_GET-ALL-BUNDLES', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getBundleById = async (req, res) => {
  try {
    const { id } = req.params;
    const bundle = await bundleModel.findBundleById({ id });
    log.out('OK_BUNDLE_GET-BUNDLE-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(bundle)
    });
    return res.json(bundle);
  } catch (error) {
    log.error('ERR_BUNDLE_GET-BUNDLE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting bundle by Id');
  }
};

const findBundlesWithNoBundleCat = async (req, res) => {
  try {
    const bundles = await bundleModel.findBundlesWithNoBundleCat();
    log.out('OK_BUNDLE_GET-BUNDLE-NO-BUNDLE-CATALOG', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(bundles)
    });
    return res.json(bundles);
  } catch (error) {
    log.error('ERR_BUNDLE_GET-BUNDLE-NO-BUNDLE-CATALOG', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res
      .status(400)
      .send({ message: 'Error getting bundles that has no bundle catalogue' });
  }
};

const getBundleByName = async (req, res) => {
  try {
    const { name } = req.body;
    const bundle = await bundleModel.findBundleByName({ name });
    log.out('OK_BUNDLE_GET-BUNDLE-BY-NAME', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(bundle)
    });
    return res.json(bundle);
  } catch (error) {
    log.error('ERR_BUNDLE_GET-BUNDLE-BY-NAME', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting bundle by name');
  }
};

const updateBundle = async (req, res) => {
  const { id, name, description, bundleProduct } = req.body;
  const { data: bundle } = await common.awaitWrap(
    bundleModel.findBundleByName({ name })
  );
  // if exists throw error
  if (bundle && bundle.id != id) {
    log.error('ERR_BUNDLE_CREATE-BUNDLE', {
      err: 'Bundle name already exists',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Bundle name already exists' });
  } else {
    const { error } = await common.awaitWrap(
      bundleModel.updateBundle({
        id,
        name,
        description,
        bundleProduct
      })
    );
    if (error) {
      log.error('ERR_BUNDLE_UPDATE-BUNDLE', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_BUNDLE_UPDATE-BUNDLE', {
        req: { body: req.body, params: req.params },
        res: { message: `Updated bundle with id:${id}` }
      });
      return res.json({ message: `Updated bundle with id:${id}` });
    }
  }
};

const deleteBundle = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(bundleModel.deleteBundle({ id }));
  if (error) {
    log.error('ERR_BUNDLE_DELETE-BUNDLE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_BUNDLE_DELETE-BUNDLE', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted bundle with id:${id}` }
    });
    return res.json({ message: `Deleted bundle with id:${id}` });
  }
};

exports.createBundle = createBundle;
exports.getAllBundles = getAllBundles;
exports.updateBundle = updateBundle;
exports.deleteBundle = deleteBundle;
exports.getBundleById = getBundleById;
exports.getBundleByName = getBundleByName;
exports.findBundlesWithNoBundleCat = findBundlesWithNoBundleCat;
