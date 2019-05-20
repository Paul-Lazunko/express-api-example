import BaseModel from './BaseModel';
import mongoose from 'mongoose';
import {roles} from '../config/userSettings';
import config from '../config/index';
import languages from '../config/languages';
let _languages = languages.map(l => l.shortName);
import {ErrorFactory} from './ErrorFactory';
import {reqQueryFormatterService} from './coreServices/reqQueryFormatterService';

export class BaseController {
  constructor(options) {
    this.context = this;
    if (options) {
      this.options = options;
      this.entity = options.entity;
      this.entities = options.entities;
      this.model = new BaseModel(options);
      this.check = [];
      for (let path in options.checkExistence) {
        for (let param in options.checkExistence[path]) {
          if (options.checkExistence[path][param].exists) {
            let model = options.checkExistence[path][param].exists.model;
            this.check.push(`${path}_${param}_exists`);
            this[`${path}_${param}_exists`] = async (req, res, next) => {
              if (req[path][param]) {
                let query = {};
                query[options.checkExistence[path][param].exists.param] = req[path][param];
                let exists = await mongoose.model(model).findOne(query);
                if (!exists) {
                  throw ErrorFactory.getError('notFound');
                } else {
                  next();
                }
              } else {
                next();
              }
            };
          }
        }
      }
    }
  }

  get try() {
    return new Proxy(this.context, {
      get(target, name) {
        if (typeof target[name] === 'function') {
          return async function(req, res, next) {
            try {
              return await target[name].apply(target, [req, res, next]);
            } catch (e) {
              next(e);
            }
          };
        }
        return target[name];
      },
    });
  }

  json(code, res, status, data, req = null) {
    return res.status(code).json({status, data});
  }

  buildQueryData(req) {
    return reqQueryFormatterService.format(req);
  }
}
