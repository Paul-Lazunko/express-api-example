import Joi from 'joi';
import * as JoiMethods from '../../config/JoiSettings';

const options = {
  entity: 'user',

  entities: 'users',

  model: 'User',

  enableRoutesWithRoleAccess: {
    create: 0,
    list: 1,
    get: 1,
    update: 1,
    file: 1,
    remove: 1,
  },

  checkExistence: {
    params: {
      id: {
        exists: {
          model: 'User',
          param: '_id',
        },
      },
    },
  },

  modelFileProperties: {
    avatar: {
      mimeTypes: ['image/jpeg', 'image/png', 'image/jpg,', 'image/gif'],
      maxSize: 20971520,
    },
  },

  overriddenMongooseMethods: {
    create: true,
    update: true,
  },

  validationSchemas: {
    params: Joi.object({
      id: Joi.objectId(),
    }),

    query: Joi.object({
      search: Joi.string().allow(''),
      searchBy: Joi.string().valid(['username']),
      sortBy: Joi.string().valid(['username', 'createdAt']),
      sort: Joi.string().valid(['asc', 'desc']),
      isActive: JoiMethods.default.boolean,
      page: JoiMethods.default.positiveInteger,
      perPage: JoiMethods.default.positiveInteger,
      role: JoiMethods.default.positiveInteger.valid([1, 2]),
      createdAt: JoiMethods.default.positiveInteger,
    }),

    bodyCreate: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      isActive: JoiMethods.default.boolean,
      role: JoiMethods.default.positiveInteger.valid([1, 2]),
    }),

    bodyUpdate: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      isActive: JoiMethods.default.boolean,
      role: JoiMethods.default.positiveInteger.valid([1, 2]),
    }),
  },
};

export {options};
