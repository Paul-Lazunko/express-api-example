import {User} from '../models/User';
import {Token} from '../models/Token';
import {enableEvents} from './events';
import config from '../../config';
import {roles} from '../../config/userSettings';

const activate = async function() {
  this.on('connection', async socket => {
    try {
      let handshake = socket.handshake;

      let hash = handshake.headers.authorization
        ? handshake.headers.authorization.replace('Bearer ', '')
        : handshake.query.auth_token
          ? handshake.query.auth_token
          : false;

      hash = decodeURIComponent(hash);

      if (!hash) {
        throw new Error('No token in WebSocket connection params');
      }

      hash = decodeURIComponent(hash);

      let token = await Token.findOne({hash});

      if (!token) {
        throw new Error('No token found by sockets auth');
      }

      let _id = token.user;
      let user = await User.findOne({_id}).lean();

      if (!user) {
        throw new Error('No user found by sockets auth');
      }

      socket.user = user;

      socket.join(socket.user._id.toString());

      enableEvents(socket, this);

      await User.update({_id: socket.user._id}, {isOnline: true});

      this.emit('userOnline', {user: socket.user});
    } catch (error) {
      console.log({socket: {error}});

      socket.disconnect();
    }
  });
};

export {activate};
