const jwt = require('jsonwebtoken');
const { log } = require('../helpers/logger');
const config = process.env;

const verifyToken = (req, res, next) => {
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

const verifyStaff = (req, res, next) => {
  const corsWhitelist = [
    'http://localhost:3000',
    'https://algotech-fe.vercel.app',
    'https://algotech-fe-prod.vercel.app',
    'https://algotech-hrm.vercel.app',
    'https://algotech-hrm-prod.vercel.app',
    'jest'
  ];

  if (
    corsWhitelist.includes(req.headers.origin) |
    (req.hostname == 'localhost')
    // | (req.hostname == 'algotech-be.vercel.app'))
  ) {
    if ((req.user.role === 'B2B') | (req.user.role === 'CUSTOMER')) {
      log.error('ERR_AUTH_ROLE-VERIFICATION', 'user is not allowed');
      return res.status(401).send('Invalid ROLE');
    } else {
      return next();
    }
  } else {
    return res.status(401).send({ message: 'Unauthorized' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role != 'ADMIN') {
    log.error('ERR_AUTH_ROLE-VERIFICATION', 'user is not allowed');
    return res.status(401).send('Invalid ROLE');
  }
  log.out('OK_AUTH_ROLE-VERIFICATION');
  return next();
};

const whiteListInternal = (req, res, next) => {
  const corsWhitelist = [
    'http://localhost:3000',
    'https://algotech-fe.vercel.app',
    'https://algotech-fe-prod.vercel.app',
    'jest'
  ];
  if (
    corsWhitelist.includes(req.headers.origin) |
    (req.hostname == 'localhost')
    // | (req.hostname == 'algotech-be.vercel.app'))
  ) {
    return next();
  } else {
    return res.status(401).send({ message: 'Unauthorized' });
  }
};

exports.verifyToken = verifyToken;
exports.verifyAdmin = verifyAdmin;
exports.whiteListInternal = whiteListInternal;
