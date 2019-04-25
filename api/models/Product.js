import mongoose from 'mongoose';
import crypto from 'crypto';
import {settings} from '../../config/userSettings';
import {UserCredentials} from './UserCredentials';
import {reqQueryFormatterService} from '../../core/coreServices/reqQueryFormatterService';

const ProductSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Number,
    default: Math.round(new Date().getTime() / 1000),
  },
});

const subQueryFields = ['user', 'price', 'amount', 'isActive', 'createdAt'];

ProductSchema.statics.overriddenFind = async req => {
  let productsPipeline = [],
    totalCountPipeline = [],
    subQuery = {},
    {query, sorting, pagination} = reqQueryFormatterService.format(req);

  for (let prop in query) {
    if (subQueryFields.includes(prop)) {
      if (prop === 'user') {
        subQuery[prop] = new mongoose.Types.ObjectId(query[prop]);
      } else {
        subQuery[prop] = query[prop];
      }
      delete query[prop];
    }
  }

  if (Object.keys(subQuery).length) {
    productsPipeline.push({$match: subQuery});
    totalCountPipeline.push({$match: subQuery});
  }

  let $project = {
      $project: {
        user: 1,
        title: 1,
        amount: 1,
        price: 1,
        createdAt: 1,
        isActive: 1,
      },
    },
    $lookup = {
      $lookup: {
        from: mongoose.model('User').collection.name,
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    $unwind = {
      $unwind: '$user',
    },
    $match = {
      $match: query.$or && query.$or.length === 1 ? query.$or[0] : query,
    },
    $sort = {
      $sort: Object.keys(sorting).length ? sorting : {createdAt: -1},
    },
    $skip = {
      $skip: pagination.skip,
    },
    $limit = {
      $limit: pagination.limit,
    },
    $group = {
      $group: {
        _id: null,
        totalCount: {$sum: 1},
      },
    },
    $project2 = {
      $project: {
        _id: 0,
        totalCount: '$totalCount',
      },
    };

  if (Object.keys(query).length) {
    productsPipeline.push($project, $lookup, $unwind, $match, $sort, $skip, $limit);
    totalCountPipeline.push($project, $lookup, $unwind, $match, $group, $project2);
  } else {
    productsPipeline.push($project, $lookup, $unwind, $sort, $skip, $limit);
    totalCountPipeline.push($project, $lookup, $unwind, $group, $project2);
  }

  let products = await mongoose.model('Product').aggregate(productsPipeline);
  let totalCountData = await mongoose.model('Product').aggregate(totalCountPipeline);

  return {products, totalCount: totalCountData[0] ? totalCountData[0].totalCount : 0};
};

const Product = mongoose.model('Product', ProductSchema);

export {Product};
