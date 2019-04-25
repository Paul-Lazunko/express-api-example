import { errors } from '../config/errors';

export class ErrorFactory {

  static getError(error) {
    let _error = errors[error] || errors.defaultError;
    let e = new Error(_error.message);
    e.code = _error.code;
    return e;
  }

}
