import Joi from 'joi';
import * as JoiMethods from '../../config/JoiSettings';

const options = {
  entity: 'token',

  entities: 'tokens',

  model: 'Token',

  enableRoutesWithRoleAccess: {
    create: 0,
    list: 1,
    get: 1,
    update: 1,
    remove: 1,
  },

  checkRequestProps: {
    query: {
      user: {
        exists: {
          model: 'User',
          param: '_id',
        },
      },
    },
  },

  overriddenMongooseMethods: {
    create: true,
  },

  resetRequestBodyData: {
    create: true,
  },

  setRequestUser: false,

  validationSchemas: {
    params: Joi.object({
      id: Joi.objectId(),
    }),

    query: Joi.object({
      sortBy: Joi.string().valid(['createdAt']),
      sort: Joi.string().valid(['asc', 'desc']),
      user: Joi.objectId().required(),
      page: JoiMethods.default.positiveInteger,
      perPage: JoiMethods.default.positiveInteger,
      from: JoiMethods.default.positiveInteger,
      to: JoiMethods.default.positiveInteger,
    }),

    bodyCreate: Joi.object({
      password: Joi.string().required(),
      username: Joi.string().required(),
    }),

    bodyUpdate: Joi.object({
      isActive: JoiMethods.default.boolean,
      fireBaseToken: Joi.string(),
    }),
  },
};

export {options};
