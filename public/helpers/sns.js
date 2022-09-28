const AWS = require('aws-sdk');

const sns = new AWS.SNS({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: 'ap-southeast-1'
});

const sendOTP = (req) => {
  // const { number, message } = req;
  const params = {
    Message: 'testing hello',
    TopicArn:
      'arn:aws:sns:ap-southeast-1:407923579514:TheKettleGourmet:475f0b15-2c88-46d8-a5e9-ce07c692fcd2'
  };
  var phonenumPromise = sns
    .checkIfPhoneNumberIsOptedOut({
      phoneNumber: '+6591114685'
    })
    .promise();
  console.log(phonenumPromise);
  return sns
    .publish(params)
    .promise()
    .then(console.log('sent'))
    .catch((err) => {
      return err;
    });
};

exports.sendOTP = sendOTP;
