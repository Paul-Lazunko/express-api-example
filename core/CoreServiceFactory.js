import { setup } from '../config/actions/setup';
const mongoose = setup();

export class CoreServiceFactory {

  static get mongoose () {
    return mongoose;
  }

}
