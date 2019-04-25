import Redis from 'redis';
import config from '../../config';

const redis = Redis.createClient(config.db.redis);

export { redis };
