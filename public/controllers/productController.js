const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
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
  const {
    sku,
    name,
    description,
    image,
    categories,
    brand_id,
    qtyThreshold,
    locations
  } = req.body;
  // check if product exists

  const productSku = await productModel.findProductBySku({ sku });
  const productName = await productModel.findProductByName({ name });

  // if exists throw error
  if (productSku) {
    log.error('ERR_PRODUCT_CREATE-PRODUCT');
    res.status(400).json({ message: 'Product sku already exists' });
  } else if (productName) {
    log.error('ERR_PRODUCT_CREATE-PRODUCT');
    res.status(400).json({ message: 'Product name already exists' });
  } else {
    // find or create category
    // const { error: connectOrCreateCategoryError } = await common.awaitWrap(
    //   categoryModel.connectOrCreateCategory({ categories })
    // );
    // log.out('OK_CATEGORY_CONNECT-CREATE-CATEGORY');
    // if (connectOrCreateCategoryError) {
    //   log.error(
    //     'ERR_CATEGORY_CREATE-CATEGORY',
    //     connectOrCreateCategoryError.message
    //   );
    //   const e = Error.http(connectOrCreateCategoryError);
    //   res.status(e.code).json(e.message);
    // }
    //uploadImg to s3
    if (image) {
      try {
        await uploadS3({
          key: `productImages/${sku}-img`,
          payload: image
        });
      } catch (uploadS3Error) {
        log.error('ERR_PRODUCT_UPLOAD-S3', uploadS3Error.message);
        const e = Error.http(uploadS3Error);
        res.status(e.code).json(e.message);
      }
    }
    log.out('OK_PRODUCT_UPLOAD-S3');

    //connect to existing categories
    const { error } = await common.awaitWrap(
      productModel.createProduct({
        sku,
        name,
        description,
        qtyThreshold,
        brand_id,
        categories,
        locations
      })
    );

    if (error) {
      log.error('ERR_PRODUCT_CREATE-PRODUCT', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_PRODUCT_CREATE-PRODUCT');
      res.json({ message: 'product created' });
    }
  }
};

const getAllProducts = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    productModel.getAllProducts({})
  );

  if (error) {
    log.error('ERR_PRODUCT_GET-ALL-PRODUCTS', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_PRODUCT_GET-ALL-PRODUCTS');
    res.json(data);
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
      log.out('OK_PRODUCT_GET-PRODUCT-BY-ID');
      res.json(product);
    } else {
      log.error('ERR_PRODUCT_GET-PRODUCT', error.message);
      res.status(500).send('Server Error');
    }
  } catch (error) {
    log.error('ERR_PRODUCT_GET-PRODUCT', error.message);
    res.status(500).send('Server Error');
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
        log.error('ERR_PRODUCT_GET-S3', getS3Error.message);
      }
      log.out('OK_PRODUCT_GET-PRODUCT-IMG');
      product.image = productImg;
      log.out('OK_PRODUCT_GET-PRODUCT-BY-NAME');
      res.json(product);
    } else {
      log.error('ERR_PRODUCT_GET-PRODUCT', error.message);
      res.status(500).send('Server Error');
    }
  } catch (error) {
    log.error('ERR_PRODUCT_GET-PRODUCT', error.message);
    res.status(500).send('Server Error');
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
        log.error('ERR_PRODUCT_GET-S3', getS3Error.message);
      }
      if (productImg) {
        product.image = productImg;
      }
      log.out('OK_PRODUCT_GET-PRODUCT-IMG');
      log.out('OK_PRODUCT_GET-PRODUCT-BY-SKU');

      res.json(product);
    } else {
      log.error('ERR_PRODUCT_GET-PRODUCT', error.message);
      res.status(500).send('Server Error');
    }
  } catch (error) {
    log.error('ERR_PRODUCT_GET-PRODUCT', error.message);
    res.status(500).send('Server Error');
  }
};

const updateProduct = async (req, res) => {
  const {
    id,
    name,
    description,
    image,
    sku,
    categories,
    qtyThreshold,
    brand_id,
    locations
  } = req.body;

  const productSku = await productModel.findProductBySku({ sku });
  const productName = await productModel.findProductByName({ name });

  // if exists throw error
  if (productSku && productSku.id != id) {
    log.error('ERR_PRODUCT_UPDATE-PRODUCT');
    res.status(400).json({ message: 'Product sku already exists' });
  } else if (productName && productName.id != id) {
    log.error('ERR_PRODUCT_UPDATE-PRODUCT');
    res.status(400).json({ message: 'Product name already exists' });
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
        log.error('ERR_PRODUCT_UPLOAD-S3', uploadS3Error.message);
        const e = Error.http(uploadS3Error);
        res.status(e.code).json(e.message);
      }
      log.out('OK_PRODUCT_UPLOAD-S3');
    }
    const { error } = await common.awaitWrap(
      productModel.updateProduct({
        id,
        name,
        description,
        sku,
        categories,
        qtyThreshold,
        brand_id,
        locations
      })
    );
    if (error) {
      log.error('ERR_PRODUCT_UPDATE-PRODUCT', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_PRODUCT_UPDATE-PRODUCT');
      res.json({ message: `Updated product with id:${id}` });
    }
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(productModel.deleteProduct({ id }));
  if (error) {
    log.error('ERR_PRODUCT_DELETE-PRODUCT', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_PRODUCT_DELETE-PRODUCT');
    res.json({ message: `Deleted product with id:${id}` });
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
        recipientEmail: 'meleenoob971@gmail.com',
        subject: `Daily Inventory Report ${format(today, 'yyyyMMdd')}`,
        content: 'Here are the products that are on low supply ',
        data: Buffer.from(buf).toString('base64'),
        filename: `LowStockReport${format(today, 'yyyyMMdd')}.xlsx`
      });
      console.log('EMAIL SENT');
    });
    res.status(200).json({ message: 'email sent' });
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
