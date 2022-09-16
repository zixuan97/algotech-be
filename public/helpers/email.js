const AWS = require('aws-sdk');
const mimemessage = require('mimemessage');
const fs = require('fs');

const SES_CONFIG = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: 'us-east-1'
};

const AWS_SES = new AWS.SES(SES_CONFIG);

const sendEmailWithAttachment = async (req) => {
  const { recipientEmail, subject, content, data, filename } = req;
  var mailContent = mimemessage.factory({
    contentType: 'multipart/mixed',
    body: []
  });
  mailContent.header('From', 'Auto-generated-email <exleolee@gmail.com>');
  mailContent.header('To', recipientEmail);
  mailContent.header('Subject', subject);
  // var alternateEntity = mimemessage.factory({
  //   contentType: 'multipart/alternate',
  //   body: []
  // });
  // var htmlEntity = mimemessage.factory({
  //   contentType: 'text/html;charset=utf-8',
  //   body:  '   <html>  '  +
  //         '   <head></head>  '  +
  //         '   <body>  '  +
  //         '   <h1>Hello!</h1>  '  +
  //         '   <p>Please see the attached file for the procurement order.</p>  '  +
  //         '   </body>  '  +
  //         '  </html>  '
  // });
  var plainEntity = mimemessage.factory({
    body: content
  });
  //alternateEntity.body.push(htmlEntity);
  //alternateEntity.body.push(plainEntity);
  //mailContent.body.push(alternateEntity);
  mailContent.body.push(plainEntity);
  var attachmentEntity = mimemessage.factory({
    contentType: 'text/plain',
    contentTransferEncoding: 'base64',
    body: data.toString('base64').replace(/([^\0]{76})/g, '$1\n')
  });
  attachmentEntity.header(
    'Content-Disposition',
    `attachment ;filename="${filename}"`
  );
  mailContent.body.push(attachmentEntity);
  try {
    await AWS_SES.sendRawEmail(
      {
        RawMessage: { Data: mailContent.toString() }
      },
      (err, sesdata, res) => {}
    ).promise();
  } catch (err) {
    throw err;
  }
};

const sendEmail = (req) => {
  const { recipientEmail, subject, content } = req;
  const params = {
    Source: 'Auto-generated-email <exleolee@gmail.com>',
    Destination: {
      ToAddresses: [recipientEmail]
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: content
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    }
  };
  return AWS_SES.sendEmail(params).promise();
};

exports.sendEmail = sendEmail;
exports.sendEmailWithAttachment = sendEmailWithAttachment;
