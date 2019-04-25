import {Notificator} from '../services/notificator';

const events = {
  'user.created': async (data, next) => {
    next();
  },
};

export {events};
