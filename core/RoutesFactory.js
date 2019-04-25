import {RouterFactory} from './RouterFactory';
import {CrudController} from './CrudController';
import {BadRequestHandler} from './handlers/BadRequestHandler';
import {NotFoundHandler} from './handlers/NotFoundHandler';
import * as joi from 'express-joi-validation';
import config from '../config/index';
import {roles} from '../config/userSettings';
import {uploadFileHandler} from './handlers/uploadHandler';
import {accessHandler} from '../api/accessHandler/accessHandler';
import * as clientConfig from '../api/clientsConfigRoutes';
import {store} from './DataStore';
import {permissionsExeptions} from '../config/permissionsExeptionsRoutes';
import {cors} from './handlers/cors';

const validate = joi.default({passError: true});
const joiOptions = {joi: {convert: true, allowUnknown: false}};

let PermissionSchema = {};

const getHTTPMethod = {
  create: 'post',
  list: 'get',
  get: 'get',
  update: 'patch',
  remove: 'delete',
  file: 'post',
};

const getValidationPath = {
  create: 'body',
  list: 'query',
  get: 'params',
  update: 'params body',
  remove: 'params',
  file: 'params',
};

const getValidationScheme = {
  create: 'bodyCreate',
  list: 'query',
  get: 'params',
  update: 'params bodyUpdate',
  remove: 'params',
  file: 'params',
};

const getHTTPPathName = {
  create: 'entityPath',
  list: 'entitiesPath',
  get: 'entityWithIdPath',
  update: 'entityWithIdPath',
  remove: 'entityWithIdPath',
  file: 'entityWithIdPathFile',
};

export class RoutesFactory {
  static enableConfigRoutes(app) {
    app.use(cors);
    for (let property in clientConfig.default) {
      let data = {},
        status = true;
      data[property] = clientConfig.default[property];
      app.get(`/api/${config.api.version}/config/${property}`, (req, res, next) => {
        res.status(200).json({status, data});
      });
    }
  }

  static enableRoutes(app, options) {
    const paths = {
      entityPath: '/',
      entitiesPath: '/',
      entityWithIdPath: '/:id',
      entityWithIdPathFile: '/:id/file',
    };

    let router = RouterFactory.getRouter();
    let controller = new CrudController(options);

    if (!options.enableRoutesWithRoleAccess) {
      options.enableRoutesWithRoleAccess = {
        create: 0,
        list: 0,
        get: 0,
        update: 0,
        remove: 0,
        file: 0,
      };
    }

    for (let method in options.enableRoutesWithRoleAccess) {
      let httpMethod = getHTTPMethod[method];
      let path = paths[getHTTPPathName[method]];
      let validationPath = getValidationPath[method].split(' ');
      let validationScheme = getValidationScheme[method].split(' ');

      router[httpMethod](path, (req, res, next) => {
        req.access = {
          entity: options.entity,
          method,
        };
        next();
      });

      router[httpMethod](path, controller.try.setRequestUser);

      if (options.enableRoutesWithRoleAccess[method] !== 0) {
        router[httpMethod](path, controller.try.checkRequestUser);
        if (options.enableRoutesWithRoleAccess[method] === roles.superAdmin) {
          router[httpMethod](path, controller.try.isSuperAdmin);
        }
      }

      validationPath.map((vp, i) => {
        router[httpMethod](path, validate[vp](options.validationSchemas[validationScheme[i]], joiOptions));
      });

      if (
        ((!options.hasOwnProperty('setRequestEntity') || options.setRequestEntity) &&
          path === paths.entityWithIdPath) ||
        path === paths.entityWithIdPathFile
      ) {
        router[httpMethod](path, controller.try.setRequestEntity);
      }

      if (options.validationSchemas.headers) {
        router[httpMethod](path, validate.headers(options.validationSchemas.headers, {allowUnknown: true}));
      }

      if (options.enableRoutesWithRoleAccess[method] !== 0) {
        if (
          options.enableRoutesWithRoleAccess[method] !== roles.superAdmin &&
          !permissionsExeptions.includes(options.entity)
        ) {
          router[httpMethod](path, accessHandler);
        }
      }

      if (options.setRequestUser && ['post', 'patch'].includes(httpMethod)) {
        router[httpMethod](path, (req, res, next) => {
          if (req.user) {
            req.body.user = req.user._id.toString();
          }
          next();
        });
      }

      controller.check.map(handler => {
        router[httpMethod](path, controller.try[handler]);
      });

      if (method === 'file') {
        router[httpMethod](path, (req, res, next) => {
          req.modelFileProperties = options.modelFileProperties || {};
          next();
        });
        router[httpMethod](path, uploadFileHandler);
      }

      router[httpMethod](path, controller.try[method]);
    }

    router.use(BadRequestHandler);

    router.use(NotFoundHandler);

    app.use(`/api/${config.api.version}/${options.entity}`, router);
  }
}
