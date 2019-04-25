import Joi from 'joi';
import * as JoiMethods from '../../config/JoiSettings';

const options = {
  entity: 'product',

  entities: 'products',

  model: 'Product',

  enableRoutesWithRoleAccess: {
    create: 1,
    list: 1,
    get: 1,
    update: 1,
    remove: 1,
  },

  checkExistence: {
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
    find: true,
  },

  resetRequestBodyData: {
    list: true,
  },

  setRequestUser: true,

  validationSchemas: {
    params: Joi.object({
      id: Joi.objectId(),
    }),

    query: Joi.object({
      sortBy: Joi.string().valid(['title', 'price', 'amount', 'createdAt']),
      sort: Joi.string().valid(['asc', 'desc']),
      searchBy: JoiMethods.default.arrayOf(Joi.string().valid(['title', 'user.username'])),
      search: Joi.string().allow(''),
      user: Joi.objectId(),
      price: JoiMethods.default.positiveInteger,
      amount: JoiMethods.default.positiveInteger,
      from: JoiMethods.default.positiveInteger,
      to: JoiMethods.default.positiveInteger,
      isActive: JoiMethods.default.boolean,
      page: JoiMethods.default.positiveInteger,
      perPage: JoiMethods.default.positiveInteger,
    }),

    bodyCreate: Joi.object({
      title: Joi.string().required(),
      price: JoiMethods.default.positiveInteger.required(),
      amount: JoiMethods.default.positiveInteger.required(),
      isActive: JoiMethods.default.boolean,
    }),

    bodyUpdate: Joi.object({
      title: Joi.string(),
      price: JoiMethods.default.positiveInteger,
      amount: JoiMethods.default.positiveInteger,
      isActive: JoiMethods.default.boolean,
    }),
  },
};

export {options};
