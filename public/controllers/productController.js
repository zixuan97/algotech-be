const productModel = require('../models/productModel');
const buffer = require('buffer');
globalThis.Blob = buffer.Blob;
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { uploadS3, getS3, deleteS3 } = require('../helpers/s3');
const {
  generateInventoryExcel,
  generateLowStockExcel
} = require('../helpers/excel');
const { format } = require('date-fns');
const emailHelper = require('../helpers/email');

const createProduct = async (req, res) => {
  const { sku, name, image, categories, brand, qtyThreshold, stockQuantity } =
    req.body;
  // check if product exists

  const productSku = await productModel.findProductBySku({ sku });
  const productName = await productModel.findProductByName({ name });

  // if exists throw error
  if (productSku) {
    log.error('ERR_PRODUCT_CREATE-PRODUCT', {
      err: 'Product name already exist',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Product sku already exists' });
  } else if (productName) {
    log.error('ERR_PRODUCT_CREATE-PRODUCT', {
      err: 'Product name already exist',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Product name already exist' });
  } else {
    //uploadImg to s3
    if (image) {
      try {
        await uploadS3({
          key: `productImages/${sku}-img`,
          payload: image
        });
      } catch (uploadS3Error) {
        const e = Error.http(uploadS3Error);
        log.error('ERR_PRODUCT_UPLOAD-S3', {
          err: e.message,
          req: { body: req.body, params: req.params }
        });
        return res.status(e.code).json(e.message);
      }
    }
    log.out('OK_PRODUCT_UPLOAD-S3');

    //connect to existing categories
    const { error } = await common.awaitWrap(
      productModel.createProduct({
        sku,
        name,
        qtyThreshold,
        brand,
        categories,
        stockQuantity
      })
    );

    if (error) {
      const e = Error.http(error);
      log.error('ERR_PRODUCT_CREATE-PRODUCT', {
        err: e.message,
        req: { body: req.body, params: req.params }
      });
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_PRODUCT_CREATE-PRODUCT', {
        req: { body: req.body, params: req.params },
        res: { message: 'product created' }
      });
      return res.json({ message: 'product created' });
    }
  }
};

const getAllProducts = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    productModel.getAllProducts({})
  );

  if (error) {
    const e = Error.http(error);
    log.error('ERR_PRODUCT_GET-ALL-PRODUCTS', {
      err: e.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(e.code).json(e.message);
  } else {
    const result = await data.map((product) => {
      product.categories = product.productCategory;
      delete product.productCategory;
      return {
        ...product,
        categories: product.categories.map((category) => category.category)
      };
    });
    log.out('OK_PRODUCT_GET-ALL-PRODUCTS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(result)
    });
    return res.json(result);
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findProductById({ id });
    if (product) {
      //getImg from s3
      const { data: productImg, error: getS3Error } = await common.awaitWrap(
        getS3({
          key: `productImages/${product.sku}-img`
        })
      );

      if (getS3Error) {
        log.error('ERR_PRODUCT_GET-S3', getS3Error.message);
      }
      log.out('OK_PRODUCT_GET-PRODUCT-IMG');
      product.image = productImg;
      product.categories = product.productCategory;
      delete product.productCategory;
      product.categories = product.categories.map(
        (category) => category.category
      );

      log.out('OK_PRODUCT_GET-PRODUCT-BY-ID', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(product)
      });
      return res.json(product);
    } else {
      log.error('ERR_PRODUCT_GET-PRODUCT', {
        err: 'Error getting product',
        req: { body: req.body, params: req.params }
      });

      return res.status(400).send('Error getting product by Id');
    }
  } catch (error) {
    log.error('ERR_PRODUCT_GET-PRODUCT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting product by Id');
  }
};

const getProductByName = async (req, res) => {
  try {
    const { name } = req.body;
    const product = await productModel.findProductByName({ name });
    //getImg from s3
    if (product) {
      const { data: productImg, error: getS3Error } = await common.awaitWrap(
        getS3({
          key: `productImages/${product.sku}-img`
        })
      );

      if (getS3Error) {
        log.error('ERR_PRODUCT_GET-S3', {
          err: getS3Error.message,
          req: { body: req.body, params: req.params }
        });
      }
      log.out('OK_PRODUCT_GET-PRODUCT-IMG');
      product.image = productImg;
      product.categories = product.productCategory;
      delete product.productCategory;
      product.categories = product.categories.map(
        (category) => category.category
      );
      log.out('OK_PRODUCT_GET-PRODUCT-BY-NAME', {
        req: { body: req.body, params: req.params },
        res: product
      });
      return res.json(product);
    } else {
      log.error('ERR_PRODUCT_GET-PRODUCT', {
        err: 'Server Error',
        req: { body: req.body, params: req.params }
      });
      return res.status(400).send('Error getting product by name');
    }
  } catch (error) {
    log.error('ERR_PRODUCT_GET-PRODUCT', {
      err: 'Server Error',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting product by name');
  }
};

const getProductBySku = async (req, res) => {
  try {
    const { sku } = req.params;
    const product = await productModel.findProductBySku({ sku });
    if (product) {
      //getImg from s3
      const { data: productImg, error: getS3Error } = await common.awaitWrap(
        getS3({
          key: `productImages/${sku}-img`
        })
      );

      if (getS3Error) {
        log.error('ERR_PRODUCT_GET-S3', {
          err: getS3Error.message,
          req: { body: req.body, params: req.params }
        });
      }
      if (productImg) {
        product.image = productImg;
      }
      log.out('OK_PRODUCT_GET-PRODUCT-IMG');
      product.categories = product.productCategory;
      delete product.productCategory;
      product.categories = product.categories.map(
        (category) => category.category
      );
      log.out('OK_PRODUCT_GET-PRODUCT-BY-SKU', {
        req: { body: req.body, params: req.params },
        res: product
      });

      return res.json(product);
    } else {
      return res.status(400).send('Error getting product by Sku');
    }
  } catch (error) {
    log.error('ERR_PRODUCT_GET-PRODUCT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting product by Sku');
  }
};

const getAllProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { data, error } = await common.awaitWrap(
    productModel.getAllProductsByCategory({ categoryId })
  );

  if (error) {
    log.error('ERR_PRODUCT_GET-ALL-PRODUCTS-BY-CATEGORY', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });

    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    const result = await data.map((product) => {
      product.categories = product.productCategory;
      delete product.productCategory;
      return {
        ...product,
        categories: product.categories.map((category) => category.category)
      };
    });
    log.out('OK_PRODUCT_GET-ALL-PRODUCTS-BY-CATEGORY', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(result)
    });
    return res.json(result);
  }
};

const getAllProductsByBundle = async (req, res) => {
  const { bundleId } = req.params;
  const { data, error } = await common.awaitWrap(
    productModel.getAllProductsByBundle({ bundleId })
  );
  if (error) {
    log.error('ERR_PRODUCT_GET-ALL-PRODUCTS-BY-BUNDLE', error.message);
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    const result = await data.map((product) => {
      product.category = product.productCategory;
      delete product.productCategory;
      return {
        ...product,
        category: product.category.map((category) => category.category)
      };
    });

    log.out('OK_PRODUCT_GET-ALL-PRODUCTS-BY-BUNDLE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(result)
    });

    return res.json(result);
  }
};

const getAllProductsByLocation = async (req, res) => {
  const { locationId } = req.params;
  const { data, error } = await common.awaitWrap(
    productModel.getAllProductsByLocation({ locationId })
  );

  if (error) {
    log.error('ERR_PRODUCT_GET-ALL-PRODUCTS-BY-LOCATION', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    const result = await data.map((product) => {
      product.categories = product.productCategory;
      delete product.productCategory;
      return {
        ...product,
        categories: product.categories.map((category) => category.category)
      };
    });
    log.out('OK_PRODUCT_GET-ALL-PRODUCTS-BY-LOCATION', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(result)
    });
    return res.json(result);
  }
};

const findProductsWithNoProdCat = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    productModel.findProductsWithNoProdCat()
  );

  if (error) {
    log.error('ERR_PRODUCT_GET-ALL-PRODUCTS-NO-PRODUCT-CATALOG', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    const result = await data.map((product) => {
      product.categories = product.productCategory;
      delete product.productCategory;
      return {
        ...product,
        categories: product.categories.map((category) => category.category)
      };
    });
    log.out('OK_PRODUCT_GET-ALL-PRODUCTS-NO-PRODUCT-CATALOG', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(result)
    });
    return res.json(result);
  }
};

const getAllProductsByBrand = async (req, res) => {
  const { brandId } = req.params;
  const { data, error } = await common.awaitWrap(
    productModel.getAllProductsByBrand({ brandId })
  );
  if (error) {
    log.error('ERR_PRODUCT_GET-ALL-PRODUCTS-BY-BRAND', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    const result = await data.map((product) => {
      product.categories = product.productCategory;
      delete product.productCategory;
      return {
        ...product,
        categories: product.categories.map((category) => category.category)
      };
    });
    log.out('OK_PRODUCT_GET-ALL-PRODUCTS-BY-BRAND', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(result)
    });
    return res.json(result);
  }
};

const updateProduct = async (req, res) => {
  const {
    id,
    name,
    image,
    sku,
    categories,
    qtyThreshold,
    brand,
    stockQuantity
  } = req.body;

  const productSku = await productModel.findProductBySku({ sku });
  const productName = await productModel.findProductByName({ name });

  // if exists throw error
  if (productSku && productSku.id != id) {
    log.error('ERR_PRODUCT_UPDATE-PRODUCT', {
      err: 'Product sku already exists',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Product sku already exists' });
  } else if (productName && productName.id != id) {
    log.error('ERR_PRODUCT_UPDATE-PRODUCT', {
      err: 'Product name already exists',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Product name already exists' });
  } else {
    //uploadImg to s3
    if (image) {
      const { error: uploadS3Error } = await common.awaitWrap(
        uploadS3({
          key: `productImages/${sku}-img`,
          payload: image
        })
      );
      if (uploadS3Error) {
        const e = Error.http(uploadS3Error);
        log.error('ERR_PRODUCT_UPLOAD-S3', {
          err: e.message,
          req: { body: req.body, params: req.params }
        });

        return res.status(e.code).json(e.message);
      }
      log.out('OK_PRODUCT_UPLOAD-S3');
    } else {
      const { error: deleteS3Error } = await common.awaitWrap(
        deleteS3({
          key: `productImages/${sku}-img`
        })
      );
      if (deleteS3Error) {
        log.error('ERR_PRODUCT_DELETE-S3', {
          err: deleteS3Error.message,
          req: { body: req.body, params: req.params }
        });
      }
      log.out('OK_PRODUCT_DELETE-S3');
    }
    const { error } = await common.awaitWrap(
      productModel.updateProduct({
        id,
        name,
        sku,
        categories,
        qtyThreshold,
        brand,
        stockQuantity
      })
    );
    if (error) {
      const e = Error.http(error);
      log.error('ERR_PRODUCT_UPDATE-PRODUCT', {
        err: e.message,
        req: { body: req.body, params: req.params }
      });
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_PRODUCT_UPDATE-PRODUCT', {
        req: { body: req.body, params: req.params },
        res: { message: `Updated product with id:${id}` }
      });
      return res.json({ message: `Updated product with id:${id}` });
    }
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await productModel.findProductById({ id });
  const { error } = await common.awaitWrap(productModel.deleteProduct({ id }));
  if (error) {
    const e = Error.http(error);
    log.error('ERR_PRODUCT_DELETE-PRODUCT', {
      err: e.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(e.code).json(e.message);
  } else {
    const { error: deleteS3Error } = await common.awaitWrap(
      deleteS3({
        key: `productImages/${product.sku}-img`
      })
    );
    if (deleteS3Error) {
      log.error('ERR_PRODUCT_DELETE-S3', {
        err: deleteS3Error.message,
        req: { body: req.body, params: req.params }
      });
    }
    log.out('OK_PRODUCT_DELETE-S3');
    log.out('OK_PRODUCT_DELETE-PRODUCT');
    return res.json({ message: `Deleted product with id:${id}` });
  }
};

const generateExcel = async (req, res) => {
  const products = await productModel.getAllProducts();
  await generateInventoryExcel({ products })
    .then((blob) => {
      const timeElapsed = Date.now();
      const today = new Date(timeElapsed);
      res.type(blob.type);
      blob.arrayBuffer().then((buf) => {
        res.setHeader(
          'Content-disposition',
          `attachment; filename = InventoryData${format(
            today,
            'yyyyMMdd'
          )}.xlsx`
        );
        res.send(Buffer.from(buf));
        console.log('EXCEL GENERATED FOR INVENTORY SUCCESSFULLY');
      });
    })
    .catch((error) => {
      return res.status(400).json(error.message);
    });
};

const alertLowInventory = async (req, res) => {
  const timeElapsed = Date.now();
  const today = new Date(timeElapsed);
  const products = await productModel.getAllProducts();
  await generateLowStockExcel({ products }).then((blob) => {
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    res.type(blob.type);
    blob.arrayBuffer().then(async (buf) => {
      await emailHelper.sendEmailWithAttachment({
        recipientEmail: 'exleolee@gmail.com',
        subject: `Daily Inventory Report ${format(today, 'yyyyMMdd')}`,
        content:
          'Dear sir/madam, here are the products that are on low supply ',
        data: Buffer.from(buf).toString('base64'),
        filename: `LowStockReport${format(today, 'yyyyMMdd')}.xlsx`
      });
      console.log('EMAIL SENT FOR LOW INVENTORY');
    });
    return res.status(200).json({ message: 'email sent' });
  });
};

exports.createProduct = createProduct;
exports.getAllProducts = getAllProducts;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.getProductById = getProductById;
exports.getProductBySku = getProductBySku;
exports.getProductByName = getProductByName;
exports.generateExcel = generateExcel;
exports.alertLowInventory = alertLowInventory;
exports.getAllProductsByCategory = getAllProductsByCategory;
exports.getAllProductsByBundle = getAllProductsByBundle;
exports.getAllProductsByLocation = getAllProductsByLocation;
exports.getAllProductsByBrand = getAllProductsByBrand;
exports.findProductsWithNoProdCat = findProductsWithNoProdCat;
