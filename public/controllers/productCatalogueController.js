const productCatalogueModel = require('../models/productCatalogueModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { uploadS3, getS3, deleteS3 } = require('../helpers/s3');

const createProductCatalogue = async (req, res) => {
  const { price, product, image, description } = req.body;

  if (image) {
    try {
      await uploadS3({
        key: `productCatalogueImages/${product.sku}-img`,
        payload: image
      });
    } catch (uploadS3Error) {
      log.error('ERR_PRODUCTCAT_UPLOAD-S3', {
        err: uploadS3Error.message,
        req: { body: req.body, params: req.params }
      });
    }
  }
  log.out('OK_PRODUCTCAT_UPLOAD-S3');
  const { error } = await common.awaitWrap(
    productCatalogueModel.createProdCatalogue({
      price,
      productId: product.id,
      description
    })
  );
  if (error) {
    log.error('ERR_PRODUCTCAT_CREATE-PRODUCTCAT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_PRODUCTCAT_CREATE-PRODUCTCAT', {
      req: { body: req.body, params: req.params },
      res: { message: 'Product catalogue created' }
    });
    return res.json({ message: 'Product catalogue created' });
  }
};

const getAllProductCatalogue = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    productCatalogueModel.getAllProdCatalogue({})
  );

  if (error) {
    log.error('ERR_PRODUCTCAT_GET-ALL-PRODUCTCAT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    await Promise.all(
      data.map(async (prodCatalogue) => {
        const { data: productImg, error: getS3Error } = await common.awaitWrap(
          getS3({
            key: `productCatalogueImages/${prodCatalogue.product.sku}-img`
          })
        );

        if (getS3Error) {
          log.error('ERR_PRODUCT_GET-S3', getS3Error.message);
        }
        prodCatalogue.image = productImg;
      })
    );

    log.out('OK_PRODUCTCAT_GET-ALL-PRODUCTCAT', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getProductCatalogue = async (req, res) => {
  try {
    const { id } = req.params;
    const prodCatalogue = await productCatalogueModel.findProdCatalogueById({
      id
    });
    const { data: productImg, error: getS3Error } = await common.awaitWrap(
      getS3({
        key: `productCatalogueImages/${prodCatalogue.product.sku}-img`
      })
    );
    if (getS3Error) {
      log.error('ERR_PRODUCT_GET-S3', getS3Error.message);
    }
    prodCatalogue.image = productImg;
    log.out('OK_PRODUCTCAT_GET-PRODUCTCAT-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(prodCatalogue)
    });
    return res.json(prodCatalogue);
  } catch (error) {
    log.error('ERR_PRODUCTCAT_GET-PRODUCTCAT', error.message);
    return res.status(400).send('Error getting product catalogue');
  }
};

const updateProductCatalogue = async (req, res) => {
  const { id, price, image, product, description } = req.body;
  if (image) {
    const { error: uploadS3Error } = await common.awaitWrap(
      uploadS3({
        key: `productCatalogueImages/${product.sku}-img`,
        payload: image
      })
    );
    if (uploadS3Error) {
      log.error('ERR_PRODUCTCAT_UPLOAD-S3', {
        err: uploadS3Error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(uploadS3Error);
    }
    log.out('OK_PRODUCTCAT_UPLOAD-S3');
  } else {
    const { error: deleteS3Error } = await common.awaitWrap(
      deleteS3({
        key: `productCatalogueImages/${product.sku}-img`
      })
    );
    if (deleteS3Error) {
      log.error('ERR_PRODUCTCAT_DELETE-S3', {
        err: deleteS3Error.message,
        req: { body: req.body, params: req.params }
      });
    }
    log.out('OK_PRODUCTCAT_DELETE-S3');
  }
  const { error } = await common.awaitWrap(
    productCatalogueModel.updateProdCatalogue({ id, price, description })
  );

  if (error) {
    log.error('ERR_PRODUCTCAT_UPDATE_PRODUCTCAT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_PRODUCTCAT_UPDATE_PRODUCTCAT', {
      req: { body: req.body, params: req.params },
      res: { message: `Updated product category with id:${id}` }
    });
    return res.json({ message: `Updated product catalogue with id:${id}` });
  }
};

const deleteProductCatalogue = async (req, res) => {
  const { id } = req.params;
  const productCatalogue = await productCatalogueModel.findProdCatalogueById({
    id
  });
  const { error } = await common.awaitWrap(
    productCatalogueModel.deleteProdCatalogue({ id })
  );
  if (error) {
    log.error('ERR_PRODUCTCAT_DELETE_PRODUCTCAT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    const { error: deleteS3Error } = await common.awaitWrap(
      deleteS3({
        key: `productCatalogueImages/${productCatalogue.product.sku}-img`
      })
    );
    if (deleteS3Error) {
      log.error('ERR_PRODUCTCAT_DELETE-S3', {
        err: deleteS3Error.message,
        req: { body: req.body, params: req.params }
      });
    }
    log.out('OK_PRODUCTCAT_DELETE-S3');
    log.out('OK_PRODUCTCAT_DELETE_PRODUCTCAT', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted product category with id:${id}` }
    });
    return res.json({ message: `Deleted product category with id:${id}` });
  }
};

exports.createProductCatalogue = createProductCatalogue;
exports.getAllProductCatalogue = getAllProductCatalogue;
exports.updateProductCatalogue = updateProductCatalogue;
exports.deleteProductCatalogue = deleteProductCatalogue;
exports.getProductCatalogue = getProductCatalogue;
