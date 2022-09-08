const jwt = require('jsonwebtoken');
const { log } = require('../helpers/logger');
const config = process.env;

const verifyToken = (req, res, next) => {
  console.log(req.headers['x-access-token']);
  const token = req.headers['x-access-token'];
  if (!token) {
    log.error('ERR_AUTH_VERIFY', 'no token');
    return res.status(403).send('A token is required for authentication');
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
    log.out('OK_AUTH_VERIFY');
  } catch (err) {
    log.error('ERR_AUTH_VERIFY', 'invalid token');
    return res.status(401).send('Invalid Token');
  }
  return next();
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role != 'ADMIN') {
    log.error('ERR_AUTH_ROLE-VERIFICATION', 'user is not allowed');
    return res.status(401).send('Invalid ROLE');
  }
  log.out('OK_AUTH_ROLE-VERIFICATION');
  return next();
};

exports.verifyToken = verifyToken;
exports.verifyAdmin = verifyAdmin;
