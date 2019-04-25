const notifications = require('../../config/notifications');
import FCM from 'fcm-push';
import config from '../../config';
let fcmService;

if (config.api.useFCM) {
  const fcmSender = new FCM(config.service.fcm.serverKey);

  fcmService = {
    send: (tokens, event, data) => {
      if (typeof notifications[event] === 'function') {
        tokens.map(async item => {
          try {
            let message = {
              to: item.fireBaseToken,
              data,
              notification: notifications[event](data),
            };

            await fcmSender.send(message);
          } catch (error) {
            console.log(error);
          }
        });
      }
    },
  };
}

export {fcmService};
