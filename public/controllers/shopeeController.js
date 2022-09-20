const shopeeApi = require('../helpers/shopeeApi');
const keyModel = require('../models/keyModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createKey = async (req, res) => {
  const { key, value } = req.body;
  const { error } = await common.awaitWrap(keyModel.createKey({ key, value }));

  if (error) {
    log.error('ERR_SHOPEE_CREATE-KEY', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SHOPEE_CREATE-KEY');
    res.json({ message: `Created key with key:${key}` });
  }
};

const refreshToken = async (req) => {
  const { data: refresh_token, error } = await common.awaitWrap(
    keyModel.findKeyByName({ key: 'refresh_token' })
  );
  if (error) {
    log.error('ERR_SHOPEE_GET-REFRESH-KEY', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SHOPEE_GET-REFRESH-KEY');
    console.log('refresh_token', refresh_token);
  }
};

exports.createKey = createKey;
exports.refreshToken = refreshToken;
