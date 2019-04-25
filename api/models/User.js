import mongoose from 'mongoose';
import {roles} from '../../config/userSettings';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      set: value => {
        return value ? value.toLowerCase() : '';
      },
      get: () => {
        return this.username && this.username.length
          ? this.username.charAt(0).toUpperCase() + this.username.slice(1)
          : this.username;
      },
    },

    avatar: {
      type: String,
      default: '',
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    role: {
      type: Number,
      enum: Object.values(roles),
      default: roles.default,
    },

    lastSeen: {
      type: Number,
      default: () => {
        return Math.round(Date.now() / 1000);
      },
    },

    createdAt: {
      type: Number,
      default: () => {
        return Math.round(Date.now() / 1000);
      },
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    id: false,
  },
);

const resetUserRole = (userData, req) => {
  if (!req.user || (req.user.role !== roles.superAdmin && userData.role === roles.superAdmin)) {
    userData.roles = roles.user;
  }
};

const createCredentials = async (user, password) => {
  await mongoose.model('UserCredentials').remove({user: user._id});
  await mongoose.model('UserCredentials').create({password, user: user._id});
};

UserSchema.statics.overriddenCreate = async req => {
  let userData = req.body;
  resetUserRole(userData, req);
  let user = await mongoose.model('User').create(userData);
  if (userData.password) {
    await createCredentials(user, userData.password);
  }
  return user;
};

UserSchema.statics.overriddenUpdate = async req => {
  let userData = req.body;
  resetUserRole(userData, req);
  if (userData.password) {
    await createCredentials(user, userData.password);
  }
  return await mongoose.model('User').update({_id: req.params.id}, userData);
};

UserSchema.pre('remove', async function() {
  await mongoose.model('Token').remove({
    user: this._id,
  });

  await mongoose.model('UserCredentials').remove({
    user: this._id,
  });
});

const User = mongoose.model('User', UserSchema);

export {User};
