'use strict';
import {RoutesFactory} from './core/RoutesFactory';
import {BadRequestHandler} from './core/handlers/BadRequestHandler';
import {NotFoundHandler} from './core/handlers/NotFoundHandler';
import config from './config';
import express from 'express';
import {enableSwagger} from './core/handlers/swagger';
const app = express();

import {controllers} from './api/controllers/index';
import {cors} from './core/handlers/cors';

for (let options in controllers) {
  RoutesFactory.enableRoutes(app, controllers[options]);
}

RoutesFactory.enableConfigRoutes(app);

enableSwagger(app);

app.use(cors);
app.use(BadRequestHandler);
app.use(NotFoundHandler);

app.listen(config.httpServer.port, () => {
  console.log(`API server was started at #${config.httpServer.port} port`);
});
