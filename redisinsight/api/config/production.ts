import { join } from 'path';
import * as os from 'os';

const homedir = process.env.APP_FOLDER_ABSOLUTE_PATH
  || (join(os.homedir(), process.env.APP_FOLDER_NAME || '.redisinsight-v2'));

const prevHomedir = join(os.homedir(), '.redisinsight-preview');

export default {
  dir_path: {
    homedir,
    prevHomedir,
    logs: join(homedir, 'logs'),
    customPlugins: join(homedir, 'plugins'),
    commands: join(homedir, 'commands'),
    guides: process.env.GUIDES_DEV_PATH || join(homedir, 'guides'),
    tutorials: process.env.TUTORIALS_DEV_PATH || join(homedir, 'tutorials'),
    content: process.env.CONTENT_DEV_PATH || join(homedir, 'content'),
    caCertificates: join(homedir, 'ca_certificates'),
    clientCertificates: join(homedir, 'client_certificates'),
  },
  server: {
    env: 'production',
  },
  analytics: {
    writeKey: process.env.SEGMENT_WRITE_KEY || 'lK5MNZgHbxj6vQwFgqZxygA0BiDQb32n',
  },
  db: {
    database: join(homedir, 'redisinsight.db'),
  },
  redis_cloud: {
    url: process.env.REDIS_CLOUD_URL || 'https://api.redislabs.com/v1',
  },
};
