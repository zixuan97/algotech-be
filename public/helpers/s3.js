const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  Bucket: process.env.BUCKET,
  region: 'ap-southeast-1'
});

const uploadS3 = async (req) => {
  const { key, payload } = req;
  try {
    const params = {
      Bucket: process.env.BUCKET,
      Body: payload,
      Key: key
    };

    await s3.upload(params).promise();
  } catch (err) {
    //handle error
    throw new Error(`Could not upload file to S3: ${err.message}`);
  }
};

// Delete image from s3 bucket

const deleteS3 = async (req) => {
  const { key } = req;

  try {
    const params = {
      Bucket: process.env.BUCKET,
      Key: key
    };

    await s3.deleteObject(params).promise();
    return 'Successfully deleted file from bucket';
  } catch (err) {
    //handle error
    throw new Error(`Could not delete file from S3: ${err.message}`);
  }
};

// Get image from s3 bucket

const getS3 = async (req) => {
  const { key } = req;
  try {
    const params = {
      Bucket: process.env.BUCKET,
      Key: key
    };

    const data = await s3.getObject(params).promise();

    return data.Body.toString('utf-8');
  } catch (err) {
    throw new Error(`Could not retrieve file from S3: ${err.message}`);
  }
};

exports.uploadS3 = uploadS3;
exports.getS3 = getS3;
exports.deleteS3 = deleteS3;
