import {CoreServiceFactory} from './CoreServiceFactory';

const mongoose = CoreServiceFactory.mongoose;

export default class BaseModel {
  constructor(options) {
    this.options = options;
    this.populate = options.populate;
    require(`../api/models/${options.model}`);
    this.model = mongoose.model(options.model);
  }

  create(data, req) {
    let overriddenCreate = this.model.schema.overriddenCreate || this.model.overriddenCreate;
    return this.options.overriddenMongooseMethods.create && overriddenCreate && req
      ? overriddenCreate(req)
      : this.model.create(data);
  }

  getByProperty(query, req) {
    let overriddenFindOne = this.model.schema.overriddenFindOne || this.model.overriddenFindOne;
    let promise =
      this.options.overriddenMongooseMethods.findOne && overriddenFindOne && req
        ? overriddenFindOne(req)
        : this.model.findOne(query);
    if (Array.isArray(this.populate)) {
      this.populate.map(item => {
        promise.populate(item);
      });
    }
    if (!this.options.dontLeanModels) {
      promise.lean();
    }
    return promise;
  }

  update(query, data, req) {
    let overriddenUpdate = this.model.schema.overriddenUpdate || this.model.overriddenUpdate;
    return this.options.overriddenMongooseMethods.update && overriddenUpdate && req
      ? overriddenUpdate(req)
      : this.model.update(query, data);
  }

  async remove(query) {
    let entity = await this.model.findOne(query);
    return entity ? entity.remove() : {nRemoved: 0};
  }

  list(query, sorting, pagination, req) {
    let overriddenFind = this.model.overriddenFind || this.model.schema.overriddenFind;
    let promise;
    if (this.options.overriddenMongooseMethods.find && overriddenFind && req) {
      promise = overriddenFind(req);
    } else {
      promise = this.model
        .find(query)
        .sort(sorting)
        .skip(pagination.skip)
        .limit(pagination.limit);
      if (Array.isArray(this.populate)) {
        this.populate.map(item => {
          promise.populate(item);
        });
      }
      if (!this.options.dontLeanModels) {
        promise.lean();
      }
    }
    return promise;
  }

  count(query) {
    return this.model.find(query).countDocuments();
  }
}
