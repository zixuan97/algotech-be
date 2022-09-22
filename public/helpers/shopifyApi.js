const host_name = 'TheKettleGourmet.myshopify.com';
const version = '2022-04';
const axios = require('axios').default;

const getOrders = async (req) => {
  const url = `https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_PASSWORD}@${host_name}/admin/api/${version}/orders.json?limit=1&fulfillment_status=any&status=any`;

  return await axios
    .get(url)
    .then((res) => {
      console.log(res.data);
      const response = res.data;
      return response;
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrders = getOrders;
