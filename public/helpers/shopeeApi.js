const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const { log } = require('./logger');
const host = 'https://partner.shopeemobile.com';
// const host = 'https://partner.test-stable.shopeemobile.com'; // test
const partner_id = 2004004;
const shop_id = 2421911;
// const shop_id = 52362; //test
const redirect_url = 'https://www.google.com/';

const generateSign = async (partner_key, secret) => {
  const key = CryptoJS.enc.Utf8.parse(partner_key);
  const msg = CryptoJS.enc.Utf8.parse(secret);
  const token = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(msg, key));
  log.out('OK_SIGN-GENERATE-SHOPEE-SIGN');
  return token;
};

// generate an authorized link
const generateLink = async (req) => {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const v2_path = '/api/v2/shop/auth_partner';
  const baseString = partner_id + v2_path + timestamp;
  const token = await generateSign(process.env.SHOPEE_PARTNER_KEY, baseString);
  const url =
    host +
    v2_path +
    `?partner_id=${partner_id}&timestamp=${timestamp}&sign=${token}&redirect=${redirect_url}`;
  log.out('OK_LINK_GENERATE-SHOPEE-LINK');
  return url;
};

const refreshToken = async (req) => {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const { refresh_token } = req;

  const path = '/api/v2/auth/access_token/get';
  const body = {
    shop_id: parseInt(shop_id),
    refresh_token: refresh_token,
    partner_id: parseInt(partner_id)
  };
  const baseString = partner_id + path + timestamp;
  const token = await generateSign(process.env.SHOPEE_PARTNER_KEY, baseString);

  const url =
    host +
    path +
    `?partner_id=${partner_id}&timestamp=${timestamp}&sign=${token}`;

  return await axios
    .post(url, body)
    .then((res) => {
      console.log(res.data);
      const response = res.data;
      log.out('OK_TOKEN_REFRESH-SHOPEE-TOKEN');
      return response;
    })
    .catch((err) => {
      log.error('ERR_REFRESH-SHOPEE-TOKEN', err.message);
      throw err;
    });
};

const getAllOrders = async (req) => {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const { access_token, time_from, time_to, page_size } = req;
  const path = '/api/v2/order/get_order_list';
  const baseString = partner_id + path + timestamp + access_token + shop_id;
  const token = await generateSign(process.env.SHOPEE_PARTNER_KEY, baseString);
  const time_range_field = 'create_time';
  url = `${host}${path}?timestamp=${timestamp}&time_range_field=${time_range_field}&sign=${token}&access_token=${access_token}&shop_id=${shop_id}&time_from=${time_from}&time_to=${time_to}&page_size=${page_size}&partner_id=${partner_id}`;
  return await axios
    .get(url)
    .then((res) => {
      const response = res.data;
      log.out('OK_ORDER_GET-ALL-SHOPEE-ORDERS');
      return response;
    })
    .catch((err) => {
      log.error('ERR_GET-ALL-SHOPEE-ORDERS', err.message);
      throw err;
    });
};

const getOrderDetails = async (req) => {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const { access_token, orders } = req;
  const path = '/api/v2/order/get_order_detail';
  const baseString = partner_id + path + timestamp + access_token + shop_id;
  const token = await generateSign(process.env.SHOPEE_PARTNER_KEY, baseString);
  response_optional_fields =
    'item_list,recipient_address,total_amount,invoice_data';
  url = `${host}${path}?timestamp=${timestamp}&sign=${token}&access_token=${access_token}&shop_id=${shop_id}&order_sn_list=${orders}&partner_id=${partner_id}&response_optional_fields=${response_optional_fields}`;
  return await axios
    .get(url)
    .then((res) => {
      const response = res.data;
      log.out('OK_ORDER_GET-ALL-SHOPEE-ORDER-DETAILS');
      return response;
    })
    .catch((err) => {
      log.error('ERR_ORDER_GET-SHOPEE-ORDER-DETAILS', err.message);
      throw err;
    });
};

const getShopPerformance = async (req) => {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const { access_token } = req;
  const path = '/api/v2/account_health/shop_performance';
  const baseString = partner_id + path + timestamp + access_token + shop_id;
  const token = await generateSign(process.env.SHOPEE_PARTNER_KEY, baseString);
  url = `${host}${path}?partner_id=${partner_id}&timestamp=${timestamp}&sign=${token}&access_token=${access_token}&shop_id=${shop_id}`;

  return await axios
    .get(url)
    .then((res) => {
      log.out('OK_ORDER_GET-SHOPEE-TRACKING-INFO');
      const response = res.data;
      return response.response;
    })
    .catch((err) => {
      log.error('ERR_ORDER_GET-SHOPEE-TRACKING-INFO', err.message);
      throw err;
    });
};

const createShippingDocument = async (req) => {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const { access_token, order } = req;
  const path = '/api/v2/logistics/create_shipping_document';
  const baseString = partner_id + path + timestamp + access_token + shop_id;
  const token = await generateSign(process.env.SHOPEE_PARTNER_KEY, baseString);
  url = `${host}${path}?timestamp=${timestamp}&sign=${token}&access_token=${access_token}&shop_id=${shop_id}&partner_id=${partner_id}`;
  const body = {
    order_list: [{ order_sn: order }]
  };
  console.log(body);
  return await axios
    .post(url, body)
    .then((res) => {
      log.out('OK_ORDER_CREATE-SHOPEE-SHIPPING-DOCUMENT');
      const response = res.data;
      return response;
    })
    .catch((err) => {
      log.error('ERR_ORDER_CREATE-SHOPEE-SHIPPING-DOCUMENT', err.message);
      throw err;
    });
};

const downloadShippingDocument = async (req) => {
  const { access_token, order } = req;
  const path = '/api/v2/logistics/download_shipping_document';
  const baseString = partner_id + path + timestamp + access_token + shop_id;
  const token = await generateSign(process.env.SHOPEE_PARTNER_KEY, baseString);
  url = `${host}${path}?timestamp=${timestamp}&sign=${token}&access_token=${access_token}&shop_id=${shop_id}&partner_id=${partner_id}`;
  const body = {
    order_list: [{ order_sn: order }]
  };
  return await axios
    .post(url, body)
    .then((res) => {
      log.out('OK_ORDER_DOWNLOAD-SHOPEE-SHIPPING-DOCUMENT');
      const response = res.data;
      return response;
    })
    .catch((err) => {
      log.error('ERR_ORDER_DOWNLOAD-SHOPEE-oSHIPPING-DOCUMENT', err.message);
      throw err;
    });
};
exports.generateLink = generateLink;
exports.refreshToken = refreshToken;
exports.getAllOrders = getAllOrders;
exports.getOrderDetails = getOrderDetails;
exports.downloadShippingDocument = downloadShippingDocument;
exports.createShippingDocument = createShippingDocument;
exports.getShopPerformance = getShopPerformance;
