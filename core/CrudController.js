import {BaseController} from './BaseController';
import mongoose from 'mongoose';
import {errors} from '../config/errors';
import {roles} from '../config/userSettings';
import {unlink} from './handlers/helpers/unlink';
import {ErrorFactory} from './ErrorFactory';

export class CrudController extends BaseController {
  async get(req, res, next) {
    let data,
      resetRequestBodyData = this.options.resetRequestBodyData && this.options.resetRequestBodyData.get;
    if (resetRequestBodyData) {
      data = await this.model.getByProperty({_id: req.entity._id}, req);
    } else {
      data = {};
      data[this.entity] = await this.model.getByProperty({_id: req.params.id}, req);
    }
    super.json(200, res, true, data, req);
  }

  async list(req, res, next) {
    let {query, sorting, pagination} = super.buildQueryData(req);
    let data,
      resetRequestBodyData = this.options.resetRequestBodyData && this.options.resetRequestBodyData.list;
    if (resetRequestBodyData) {
      data = await this.model.list(query, sorting, pagination, req);
    } else {
      data = {};
      data[this.entities] = await this.model.list(query, sorting, pagination, req);
      data.totalCount = await this.model.count(query);
    }
    super.json(200, res, true, data, req);
  }

  async create(req, res, next) {
    let data,
      resetRequestBodyData =
        this.options.resetRequestBodyData &&
        (this.options.resetRequestBodyData.create || this.options.resetRequestBodyData.get);
    if (resetRequestBodyData) {
      data = await this.model.create(req.body, req);
    } else {
      data = {};
      data[this.entity] = await this.model.create(req.body, req);
      data[this.entity] = await this.model.getByProperty({_id: data[this.entity]._id}, req);
    }
    mongoose.BoundedEventEmitter.emit(`${this.entity}.created`, data);
    super.json(201, res, true, data);
  }

  async update(req, res, next) {
    let _id = req.entity ? req.entity._id : req.params.id;
    let data,
      result,
      resetRequestBodyData =
        this.options.resetRequestBodyData &&
        (this.options.resetRequestBodyData.update || this.options.resetRequestBodyData.get);
    if (resetRequestBodyData) {
      result = await this.model.update({_id}, req.body, req);
      data = result.data || {};
    } else {
      data = {};
      result = await this.model.update({_id}, req.body, req);
      data[this.entity] = await this.model.getByProperty({_id}, req);
    }
    mongoose.BoundedEventEmitter.emit(`${this.entity}.updated`, data);
    super.json(202, res, !!result.nModified, data);
  }

  async remove(req, res, next) {
    let _id = req.params.id,
      data = {};
    data[this.entity] = await this.model.getByProperty({_id}, req);
    let result = await this.model.remove({_id}, req);
    mongoose.BoundedEventEmitter.emit(`${this.entity}.removed`, data);
    super.json(202, res, !!result.nRemoved, data);
  }

  async file(req, res, next) {
    let _id = req.params.id,
      data = {},
      updated = false;
    data[this.entity] = await this.model.getByProperty({_id}, req);
    for (let property in req.files) {
      if (data[this.entity][property]) {
        try {
          await unlink(data[this.entity][property]);
        } catch (e) {
          data.error = e;
        }
      }
    }
    if (req.files && Object.keys(req.files).length) {
      await this.model.update({_id}, req.files, req);
      updated = true;
      data[this.entity] = await this.model.getByProperty({_id}, req);
    }
    super.json(202, res, updated, data);
  }

  async setRequestUser(req, res, next) {
    let authHeader = req.get('Authorization') || req.headers['Authorization'];
    if (authHeader) {
      let tokenData = {
        hash: req.get('Authorization').replace('Bearer ', ''),
        userAgent: req.headers['user-agent'],
        userIp: req.connection.remoteAddress,
      };
      //TODO: return all token data checking;
      let token = await mongoose.model('Token').findOne({hash: tokenData.hash});
      if (!token) {
        throw ErrorFactory.getError('unauthorized');
      } else {
        req.token = token;
        req.user = await mongoose.model('User').findOne({_id: token.user});
        next();
      }
    } else {
      next();
    }
  }

  checkRequestUser(req, res, next) {
    if (req.user) {
      next();
    } else {
      throw ErrorFactory.getError('unauthorized');
    }
  }

  isSuperAdmin(req, res, next) {
    if (req.user && req.user.role === roles.superAdmin) {
      next();
    } else {
      throw ErrorFactory.getError('forbidden');
    }
  }

  async setRequestEntity(req, res, next) {
    let _id = req.params.id;
    req.entity = await this.model.getByProperty({_id}, req);
    if (!req.entity) {
      throw ErrorFactory.getError('notFound');
    }
    next();
  }
}
