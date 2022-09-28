const AWS = require('aws-sdk');

const SNS_CONFIG = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: 'us-east-1'
};

//   const AWS_SNS = new AWS.SNS(SNS_CONFIG);

//   const sendOTP=(req)=>{
//     var mobileNo = “+6591114685”;

//     var params = {
//     Message: “Welcome! your mobile verification code is: “ + OTP +”     Mobile Number is:” +mobileNo, /* required */
//       PhoneNumber: mobileNo,
//       };
//       return new AWS.SNS({apiVersion: ‘2010–03–31’}).publish(params).promise()
//  .then(message => {
//  console.log(“OTP SEND SUCCESS”);
//  })
//  .catch(err => {
//  console.log(“Error “+err)
//  return err;});
//  }
