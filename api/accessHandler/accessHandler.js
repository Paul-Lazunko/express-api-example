import { roles } from '../../config/userSettings';
import { ErrorFactory } from "../../core/ErrorFactory";
import { accessStrategy } from "./accessStrategy";

const accessHandler = async ( req, res, next ) => {
  try {
    if ( req.user.role === roles.superAdmin ) {
      next();
    } else {
      if ( accessStrategy[req.access.entity] && accessStrategy[req.access.entity][req.access.method ] ) {
        let callNext = await accessStrategy[req.access.entity][req.access.method ](req);
        callNext ? next() : next( ErrorFactory.getError('forbidden'));
      } else {
         next();
      }
    }
  } catch(e) {
    next(e);
  }
};

export { accessHandler };
