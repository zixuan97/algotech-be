const LazadaAPI = require('lazada-open-platform-sdk');
const CryptoJS = require('crypto-js');
const axios = require('axios');
const { log } = require('../helpers/logger');

const refreshToken = async (req) => {
  const aLazadaAPI = new LazadaAPI(
    process.env.LAZADA_APP_KEY,
    process.env.LAZADA_APP_SECRET,
    'SINGAPORE'
  );
  const { refresh_token } = req;
  return await aLazadaAPI
    .refreshAccessToken({ refresh_token })
    .then((response) => {
      console.log(response);
      return response;
    });
};

const getOrderList = async (req) => {
  const { access_token, created_before, created_after, limit } = req;
  try {
    const aLazadaAPIWithToken = new LazadaAPI(
      process.env.LAZADA_APP_KEY,
      process.env.LAZADA_APP_SECRET,
      'SINGAPORE',
      access_token
    );

    return await aLazadaAPIWithToken
      .getOrders({ created_after, created_before, limit })
      .then((response) => {
        return response.data.orders;
      });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getOrderItems = async (req) => {
  const { access_token, order_id } = req;
  try {
    const aLazadaAPIWithToken = new LazadaAPI(
      process.env.LAZADA_APP_KEY,
      process.env.LAZADA_APP_SECRET,
      'SINGAPORE',
      access_token
    );

    return await aLazadaAPIWithToken
      .getOrderItems({ order_id })
      .then((response) => {
        return response;
      });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const generateSign = (path) => {
  const encryptMessage = CryptoJS.HmacSHA256(
    path,
    process.env.LAZADA_APP_SECRET
  ).toString(CryptoJS.enc.Hex);

  let sign = encryptMessage.toUpperCase();

  return sign;
};

const getSellerPerformance = async (req) => {
  const { access_token } = req;
  const timestamp = new Date().getTime();
  const path = '/seller/performance/get';

  const stringToSign = `${path}access_token${access_token}app_key${process.env.LAZADA_APP_KEY}sign_methodsha256timestamp${timestamp}`;
  const sign = generateSign(stringToSign);

  const url = `https://api.lazada.sg/rest${path}?app_key=${process.env.LAZADA_APP_KEY}&access_token=${access_token}&timestamp=${timestamp}&sign_method=sha256&sign=${sign}`;
  console.log(url);
  return await axios
    .get(url)
    .then((res) => {
      log.out('OK_LAZADA_GET-SELLER-PERFORMANCE');
      const response = res.data;
      return response.data;
    })
    .catch((err) => {
      log.error('ERR_LAZADA_GET-SELLER-PERFORMANCE', err.message);
      throw err;
    });
};

exports.refreshToken = refreshToken;
exports.getOrderList = getOrderList;
exports.getOrderItems = getOrderItems;
exports.getSellerPerformance = getSellerPerformance;
