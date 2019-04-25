import mongoose from 'mongoose';
import crypto from 'crypto';
import {settings} from '../../config/userSettings';
import {UserCredentials} from './UserCredentials';
import {userAgent} from '../../core/coreServices/uaParser';

const TokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  userAgent: {
    type: String,
  },

  userIp: {
    type: String,
  },

  hash: {
    type: String,
    default: () => {
      let salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
      return crypto
        .pbkdf2Sync(new Date().getTime().toString(), salt, 10000, 64, 'sha1')
        .toString('base64')
        .replace(/\=/g, '');
    },
    index: true,
  },

  fireBaseToken: {
    type: String,
    default: '',
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  expiresAt: {
    type: Date,
    default: Date.now,
    expires: settings.token.expiresInSeconds,
  },

  createdAt: {
    type: Number,
    default: Math.round(new Date().getTime() / 1000),
  },
});

TokenSchema.statics.overriddenCreate = async req => {
  let username = req.body.username.toLowerCase(),
    password = req.body.password,
    isActive = true,
    success,
    error;

  let user = await mongoose.model('User').findOne({username, isActive});

  if (!user) {
    error = new Error("User with such credentials doesn't exist");
    error.code = 403;
    error.property = 'entity';
    error.path = 'database';
    throw error;
  }

  let userCredentials = await mongoose.model('UserCredentials').findOne({user: user._id});
  success = userCredentials ? userCredentials.authenticate(password) : false;

  if (!success) {
    error = new Error('Invalid password was sent');
    error.code = 403;
    error.property = 'password';
    error.path = 'body';
    throw error;
  }

  let tokenData = {
    user: user._id,
    userAgent: userAgent(req.headers['user-agent']),
    userIp: req.connection.remoteAddress,
  };

  let token = await mongoose.model('Token').create(tokenData);
  token = await mongoose.model('Token').findOne({_id: token._id});
  return {token, user};
};

const Token = mongoose.model('Token', TokenSchema);

export {Token};
