import * as messente from 'messente';
import config from '../../config';

const client = messente.createClient({
  username: config.service.messente.username,
  password: config.service.messente.password,
  secure: true
});

const sms = ( data ) => {
  return new Promise((resolve,reject) => {
    client.sendMessage(data, function(err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export { sms };
