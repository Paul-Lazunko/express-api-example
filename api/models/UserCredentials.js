import mongoose from 'mongoose';
const crypto = require('crypto');
const md5 = require('md5');
import {settings} from '../../config/userSettings';
import {generateRandomString} from '../services/randomStringGeneratorService';
import {ErrorFactory} from '../../core/ErrorFactory';

const UserCredentialsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  passwordHash: {
    type: String,
    required: true,
  },

  salt: {
    type: String,
  },

  passwordResetToken: {
    type: String,
    default: () => {
      md5(Math.round(Date.now() / 1000));
    },
  },

  createdAt: {
    type: Date,
    default: () => {
      Math.round(Date.now() / 1000);
    },
  },
});

UserCredentialsSchema.virtual('password').set(async function(password) {
  this.salt = this.makeSalt();
  this.passwordHash = this.createHash(password);
  this.passwordResetToken = md5(Math.round(Date.now() / 1000));
});

UserCredentialsSchema.methods.authenticate = function(plainText) {
  return this.createHash(plainText) === this.passwordHash;
};

UserCredentialsSchema.methods.makeSalt = function() {
  return crypto.randomBytes(16).toString('base64');
};

UserCredentialsSchema.methods.createHash = function(password) {
  if (!password || !this.salt) {
    return '';
  }
  let salt = new Buffer(this.salt, 'base64');
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha1').toString('base64');
};

const UserCredentials = mongoose.model('UserCredentials', UserCredentialsSchema);

export {UserCredentials};
