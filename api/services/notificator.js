import {io} from '../socket.io/index';
import {fcmService} from './fcmService';
import mongoose from 'mongoose';

export class Notificator {
  static emitTo(room, event, data) {
    io.to(room).emit(event, data);
  }

  static disableSockets(users) {
    let sockets = io.sockets.sockets;
    for (let user of users) {
      for (let socketId in sockets) {
        if (sockets[socketId].user && sockets[socketId].user._id.toString() === user._id.toString()) {
          sockets[socketId].isBlocked = true;
        }
      }
    }
  }

  static enableSockets(users) {
    let sockets = io.sockets.sockets;
    for (let user of users) {
      for (let socketId in sockets) {
        if (sockets[socketId].user && sockets[socketId].user._id.toString() === user._id.toString()) {
          sockets[socketId].isBlocked = false;
        }
      }
    }
  }

  static leaveRoomBySockets(room, users) {
    let sockets = io.sockets.sockets;
    for (let user of users) {
      for (let socketId in sockets) {
        if (sockets[socketId].user && sockets[socketId].user._id.toString() === user._id.toString()) {
          sockets[socketId].leave(room, () => {});
        }
      }
    }
  }

  static joinRoomBySockets(room, users) {
    let sockets = io.sockets.sockets;
    for (let user of users) {
      for (let socketId in sockets) {
        if (sockets[socketId].user && sockets[socketId].user._id.toString() === user._id.toString()) {
          sockets[socketId].join(room, () => {});
        }
      }
    }
  }

  static async getNotificationUsers(recipients) {
    let sockets = io.sockets.sockets,
      io = [],
      fcm = [];

    if (Array.isArray(recipients) && recipients.length) {
      for (let i = 0; i < recipients.length; i++) {
        let found = false;
        for (let socketId in sockets) {
          if (
            !sockets[socketId].isBlocked &&
            sockets[socketId].user &&
            recipients[i] &&
            sockets[socketId].user._id.toString() === recipients[i]._id.toString()
          ) {
            io.push(socketId);
            found = true;
          }
        }

        if (!found) {
          let tokens = await mongoose
            .model('Token')
            .find({user: recipients[i]._id})
            .select('fireBaseToken -_id user');
          tokens.map(token => {
            if (token.fireBaseToken) {
              fcm.push(token);
            }
          });
        }
      }
    }

    return {io, fcm};
  }

  static async emitEvent(event, data, recipients, noPush = null) {
    let users = await Notificator.getNotificationUsers(recipients);
    users.io.map(socketId => {
      io.to(socketId).emit(event, data);
    });
    if (!noPush) {
      fcmService.send(users.fcm, event, data);
    }
  }
}
