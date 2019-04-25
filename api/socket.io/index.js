import config from '../../config/index'
import fs from 'fs';
import https from 'https';
import IO from 'socket.io';
import ioRedis from 'socket.io-redis';
import { activate } from './activate';

let io;

if ( config.api.useSockets ) {

  const options = {
    key: fs.readFileSync(config.ssl.key),
    cert: fs.readFileSync(config.ssl.cert)
  };

  const server = https.createServer(options);

  io = IO( server, config.socketServer.options );

  io.adapter( ioRedis(config.db.redis) );

  io.activate = activate.bind(io);

  server.listen( config.socketServer.port, async () => {

    await io.activate();

    console.log('Socket server was started at #' + config.socketServer.port + ' port');

  });
}

export { io };
