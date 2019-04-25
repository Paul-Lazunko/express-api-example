import config from '../../../config/index';
import { S3 } from 'aws-sdk';

const s3 = new S3({
  accessKeyId:  config.service.awsS3.accessKeyId,
  secretAccessKey:  config.service.awsS3.secretAccessKey,
  Bucket:  config.service.awsS3.Bucket
});

const unlink = (path) => {
  path = path.split('/');
  let params = { Bucket: config.service.awsS3.Bucket, Key: path [ path.length - 1 ] };
  return new Promise((resolve, reject) => {
    s3.deleteObject(params, function(error, data) {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  })
};

export { unlink };
