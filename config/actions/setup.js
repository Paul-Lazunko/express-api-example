import mongoose from 'mongoose';
import config from '../index';
import EventEmitter from 'node-chain-event-emitter';
import {events} from '../../api/events';

let emitter = new EventEmitter();
for (let event in events) {
  emitter.on(event, events[event]);
}

function setup() {
  mongoose.Promise = global.Promise;
  mongoose.BoundedEventEmitter = emitter;

  const dbURI = `mongodb://${config.db.mongodb.host}:${config.db.mongodb.port}/${config.db.mongodb.name}`;

  mongoose.connect(
    dbURI,
    {useNewUrlParser: true},
  );

  mongoose.connection.on('connected', () => {
    console.log('Mongoose connection open to ' + dbURI);
  });

  mongoose.connection.on('error', err => {
    console.log('Mongoose connection error: ' + err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
  });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose disconnected through app termination');
      process.exit(0);
    });
  });

  return mongoose;
}

export {setup};
