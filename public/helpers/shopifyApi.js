const host_name = 'TheKettleGourmet.myshopify.com';
const version = '2022-04';
const axios = require('axios').default;

const getOrders = async (req) => {
  const { last_date, latestId, limit } = req;
  let optional_fields = latestId ? `&since_id=${latestId}` : '';
  optional_fields += last_date ? `&created_at_min=${last_date}` : '';

  const url =
    `https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_PASSWORD}@${host_name}/admin/api/${version}/orders.json?limit=${limit}&fulfillment_status=any&status=any` +
      optional_fields ?? `${optional_fields}`;

  return await axios
    .get(url)
    .then((res) => {
      const response = res.data.orders;
      return response;
    })
    .catch((err) => {
      throw err;
    });
};

exports.getOrders = getOrders;
