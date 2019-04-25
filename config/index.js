import os from 'os';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  api: {
    url: 'http://localhost:8888',
    version: 'v1',
    email: 'webmaster@localhost',
    useSockets: false,
    useFCM: false,
  },
  default: {
    language: 'en',
  },
  httpServer: {
    scheme: process.env.httpServerScheme || 'http',
    host: process.env.httpServerHost || 'localhost',
    port: process.env.httpServerPort || 8888,
  },
  socketServer: {
    port: process.env.socketServerPort || 7777,
    options: {
      path: '/',
      serveClient: true,
      transports: ['polling', 'websocket'],
      pingInterval: 5000,
      pingTimeout: 10000,
      cookie: true,
      secure: true,
    },
  },
  ssl: {
    key: os.homedir() + '/ssl/stag-rmt.powercode.pro/privkey.pem',
    cert: os.homedir() + '/ssl/stag-rmt.powercode.pro/fullchain.pem',
  },
  db: {
    mongodb: {
      host: process.env.mongoDBHost || 'localhost',
      port: process.env.mongoDBPort || 27017,
      name: process.env.mongoDBName || 'test',
    },
    redis: {
      host: process.env.redisHost || 'localhost',
      port: process.env.redisPort || 6379,
      expireKeys: 86400,
    },
  },
  service: {
    awsS3: {
      accessKeyId: process.env.awsS3AccessKeyId,
      secretAccessKey: process.env.awsS3SecretAccessKeyId,
      Bucket: process.env.awsS3Bucket,
      baseURL: process.env.awsS3URL || 's3.eu-central-1.amazonaws.com',
    },
    messente: {
      username: process.env.messenteUsername,
      password: process.env.messentePassword,
    },
    fcm: {
      serverKey: process.env.fcmServerKey,
      messagingSenderId: process.env.fcmMessagingSenderId,
      title: process.env.fcmTitle,
    },
    nodemailer: {
      auth: {
        user: process.env.gmailUser,
        pass: process.env.gmailPassword,
      },
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
    },
  },
};
