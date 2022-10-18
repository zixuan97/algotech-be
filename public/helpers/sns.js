const AWS = require('aws-sdk');
const { log } = require('../helpers/logger');

const sns = new AWS.SNS({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: 'ap-southeast-1'
});

const sendOTP = (req, res) => {
  // const { number, message } = req;
  const params = {
    Message: 'testing hello',
    PhoneNumber: '+6593861801'
  };
  sns
    .publish(params)
    .promise()
    .then(function (data) {
      log.out('OK_SNS_SEND-OTP', {
        req: { body: req.body, params: req.params },
        res: data
      });
      return res.json({ message: `Message ID is ${data.MessageId}` });
    })
    .catch(function (err) {
      log.error('ERR_SNS_SEND-OTP', {
        err: err.message,
        req: { body: req.body, params: req.params }
      });
      return res.status(Error.http(err).code).json(e.message);
    });
};

exports.sendOTP = sendOTP;
