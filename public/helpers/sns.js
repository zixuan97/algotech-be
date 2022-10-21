const AWS = require('aws-sdk');
const { log } = require('../helpers/logger');

const sns = new AWS.SNS({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: 'ap-southeast-1'
});

const sendOTP = (req, res) => {
  let { number, message } = req;
  if (number !== null && !number.startsWith('+65')) number = `+65${number}`;
  const params = {
    Message: message,
    PhoneNumber: number
  };
  sns
    .publish(params)
    .promise()
    .then(function (data) {
      log.out('OK_SNS_SEND-OTP', {
        req,
        res: data
      });
    })
    .catch(function (err) {
      log.error('ERR_SNS_SEND-OTP', {
        err: err.message,
        req
      });
    });
};

exports.sendOTP = sendOTP;
