import config from '../../../config';
import { S3 } from 'aws-sdk'

const s3 = new S3({
  accessKeyId: config.services.awsS3.accessKeyId,
  secretAccessKey: config.services.awsS3.secretAccessKey,
  Bucket: config.services.awsS3.Bucket
});

const awsS3 = (path) => {
  path = path.split('/');
  let params = { Bucket: config.services.awsS3.Bucket, Key: path [ path.length - 1 ] };
  return new Promise((resolve, reject) => {
    s3.getObject(params, function(error, data) {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  })
};

export { awsS3 };
