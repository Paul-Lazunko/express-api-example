import Joi from 'joi';
import * as OI from 'joi-objectid';
import langs from '../config/languages';
import * as timeZones from './timeZones';

let languages = {};
langs.map(lang => {
  languages[lang.shortName] = Joi.string();
});
languages = Joi.object(languages);

Joi.objectId = OI.default(Joi);

const values = ['$gt', '$gte', '$lt', '$lte', '$nin', '$in'];

let compare = types => {
  return Joi.array().items(
    Joi.object({
      operand: Joi.string().required(),
      value: Joi.required(),
    }),
  );
};

/**
 *  Joi constants
 **/

export default {
  boolean: Joi.number()
    .integer()
    .valid([0, 1]),
  positiveInteger: Joi.number()
    .integer()
    .positive(),
  regExp: pattern => Joi.string().regex(pattern),
  arrayOf: element => Joi.array().items(element),
  arrayOfId: Joi.array().items(Joi.objectId()),
  phoneNumber: Joi.string().regex(/^\+[0-9]{11,13}/),
  location: Joi.object({
    geo: Joi.array()
      .items(Joi.number())
      .max(2)
      .min(2),
    name: Joi.string(),
  }),
  timeZone: Joi.string().valid(timeZones),
  languages,
  compare,
};
