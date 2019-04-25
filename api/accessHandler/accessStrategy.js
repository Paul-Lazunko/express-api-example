import mongoose from 'mongoose';
import {roles} from '../../config/userSettings';

let isSuperAdmin = user => {
  return user && user.role === roles.superAdmin;
};

let userAccessToEntity = async (req, entity, query) => {
  if (isSuperAdmin(req.user)) {
    return true;
  } else if (req.user) {
    let element = await mongoose.model(entity).find(query);
    return element && element.user.toString() === req.user._id.toString();
  } else {
    return false;
  }
};

let isMeOrSuperAdmin = async (req, path, param) => {
  if (isSuperAdmin(req.user)) {
    return true;
  } else if (req.user) {
    return req.user._id.toString() === req[path][param];
  } else {
    return false;
  }
};

let accessStrategy = {
  user: {
    update: async req => {
      return await isMeOrSuperAdmin(req, 'params', 'id');
    },
    remove: async req => {
      return await isMeOrSuperAdmin(req, 'params', 'id');
    },
    file: async req => {
      return await isMeOrSuperAdmin(req, 'params', 'id');
    },
  },
  token: {
    list: async req => {
      return await isMeOrSuperAdmin(req, 'query', 'user');
    },
    get: async req => {
      return await userAccessToEntity(req, 'Token', {_id: req.params.id});
    },
    update: async req => {
      return await userAccessToEntity(req, 'Token', {_id: req.params.id});
    },
    remove: async req => {
      return await userAccessToEntity(req, 'Token', {_id: req.params.id});
    },
  },
  product: {
    update: async req => {
      return await userAccessToEntity(req, 'Product', {_id: req.params.id});
    },
    file: async req => {
      return await userAccessToEntity(req, 'Product', {_id: req.params.id});
    },
    remove: async req => {
      return await userAccessToEntity(req, 'Product', {_id: req.params.id});
    },
  },
};

export {accessStrategy};
