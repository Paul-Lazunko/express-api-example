import md5 from 'md5';
import Busboy from 'async-busboy';
import {streamUploader} from './helpers/awsS3streamUploader';
import config from '../../config';
import {errors} from '../../config/errors';
import {ErrorFactory} from '../ErrorFactory';

const uploadFileHandler = async (req, res, next) => {
  req.files = req.files || {};
  req.filesData = req.filesData || {};

  const {files, fields} = await Busboy(req, {
    onFile: async (fieldName, file, fileName, encoding, mimeType) => {
      let fields = Object.keys(req.modelFileProperties);

      if (fieldName && fields.includes(fieldName)) {
        if (req.modelFileProperties[fieldName].mimeTypes.includes(mimeType)) {
          let size = 0;

          file.on('data', function(data) {
            size += data.length;
            if (size > req.modelFileProperties[fieldName].maxSize) {
              next(ErrorFactory.getError('fileSizeError'));
            }
          });

          let name = md5(Date.now());

          let fn = fileName.split('.');

          name += '.' + fn[fn.length - 1];

          await streamUploader({name, file});

          let path = `https://${config.service.awsS3.Bucket}.${config.service.awsS3.baseURL}/${name}`;

          req.files[fieldName] = req.files[fieldName] || [];
          req.filesData[fieldName] = req.filesData[fieldName] || [];
          req.files[fieldName].push(path);
          req.filesData[fieldName].push({mimeType, fileName});
          next();
        } else {
          next(ErrorFactory.getError('fileTypeError'));
        }
      } else {
        next(ErrorFactory.getError('fileFieldError'));
      }
    },
  });
};

export {uploadFileHandler};
