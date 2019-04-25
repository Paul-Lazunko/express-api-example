import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import {cors} from './handlers/cors';
import {xEcho} from './handlers/x-echo';
import express from 'express';

export class RouterFactory {
  static getRouter() {
    const router = express.Router();

    router.use(helmet());

    router.use(morgan('dev'));

    router.use(cors);

    router.use(xEcho);

    router.use(bodyParser.urlencoded({limit: '20mb', extended: false}));

    router.use(bodyParser.json({limit: '20mb', extended: true}));

    return router;
  }
}
