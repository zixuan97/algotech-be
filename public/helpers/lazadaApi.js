const LazadaAPI = require('lazada-open-platform-sdk');
const aLazadaAPI = new LazadaAPI(
  process.env.LAZADA_APP_KEY,
  process.env.LAZADA_APP_SECRET,
  'SINGAPORE'
);

const refreshToken = async (req) => {
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

exports.refreshToken = refreshToken;
exports.getOrderList = getOrderList;
exports.getOrderItems = getOrderItems;
