const axios = require('axios');
const host = 'https://partner.shopeemobile.com';
const timestamp = Date.now();
const partner_id = 2004004;
const shop_id = 2421911;
const shop_test_id = 52362;
const v2_path = '/api/v2/shop/auth_partner';
const redirect_url = 'https://www.google.com/';

// generate an authorized link
const generateLink = async (req) => {
  const baseString = partner_id + v2_path + timestamp;
  const token = crypto
    .createHash('sha256')
    .update(baseString + process.env.PARTNER_KEY)
    .digest('hex');
  const url =
    host +
    v2_path +
    `?partner_id=${partner_id}&timestamp=${timestamp}&sign=${token}&redirect=${redirect_url}`;

  return url;
};

const refreshToken = async (req) => {
  const { refresh_token } = req;
  const path = '/api/v2/auth/access_token/get';
  const body = {
    shop_id: shop_id,
    refresh_token: refresh_token,
    partner_id: partner_id
  };
  const baseString = partner_id + v2_path + timestamp;
  const token = crypto
    .createHash('sha256')
    .update(baseString + process.env.PARTNER_KEY)
    .digest('hex');
  const url =
    host +
    path +
    `?partner_id=${partner_id}&timestamp=${timestamp}&sign=${token}`;

  return axios.post(url, body);
};

exports.generateLink = generateLink;
exports.refreshToken = refreshToken;
