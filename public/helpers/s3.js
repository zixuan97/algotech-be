const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  Bucket: process.env.BUCKET,
  region: 'ap-southeast-1'
});

const uploadS3 = async (req) => {
  const { key, payload } = req;

  const params = {
    Bucket: process.env.BUCKET,
    Body: payload,
    Key: key
  };

  s3.upload(params, function (err, data) {
    //handle error
    if (err) {
      throw err;
    }

    //success
    if (data) {
      return data.Location;
    }
  });
};

// Delete image from s3 bucket

const deleteS3 = async (req) => {
  const { key } = req;

  const params = {
    Bucket: process.env.BUCKET,
    Key: key
  };

  s3.deleteObject(params, function (err, data) {
    //handle error
    if (err) {
      throw err;
    } else {
      return 'Successfully deleted file from bucket';
    }
  });
};

// Get image from s3 bucket

const getS3 = async (req) => {
  const { key } = req;
  const params = {
    Bucket: process.env.BUCKET,
    Key: key
  };

  s3.getObject(params, function (err, data) {
    //handle error
    if (err) {
      console.log(err);
      throw err;
    }

    //success
    if (data) {
      let objectData = data.Body.toString('utf-8');
      return objectData;
    }
  });
};

exports.uploadS3 = uploadS3;
exports.getS3 = getS3;
exports.deleteS3 = deleteS3;
