const AWS = require('aws-sdk');

const SES_CONFIG = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: 'us-east-1',
};

const AWS_SES = new AWS.SES(SES_CONFIG);

const sendEmail = (req) => {
  const { email, subject, content } = req;
  const params = {
    Source: 'Meryl <e0421281@u.nus.edu>',
    Destination: {
      ToAddresses: [
        email
      ],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: content,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      }
    },
  };
  return AWS_SES.sendEmail(params).promise();
};

exports.sendEmail = sendEmail;